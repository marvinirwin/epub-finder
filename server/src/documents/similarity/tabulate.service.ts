import {InjectRepository} from "@nestjs/typeorm";
import {DocumentView} from "../../entities/document-view.entity";
import {FindOneOptions, Repository} from "typeorm";
import {s3ReadStream} from "../uploading/s3.service";
import {AtomizedDocument, Segment, SerializedTabulation} from "../../shared";
import trie from "trie-prefix-tree";
import {CacheService} from "../../util/cache.service";
import {Inject} from "@nestjs/common";
import {SetWithUniqueLengths} from "../../shared/tabulate-documents/set-with-unique-lengths";


export class TabulateService {
    constructor(
        @InjectRepository(DocumentView)
        private documentViewRepository: Repository<DocumentView>,
        @Inject(CacheService)
        private cacheService: CacheService
    ) {

    }

    async tabulate(findOptions: FindOneOptions<DocumentView>, words: string[]): Promise<SerializedTabulation> {
        return this.cacheService.memo<SerializedTabulation>(
            {
                args: [findOptions, words],
                service: "TABULATE",
                cb: async () => {
                    return await this.tabulateNoCache(findOptions, words);
                }
            }
        )
    }

    async tabulateNoCache(findOptions: FindOneOptions<DocumentView>, words: string[]) {
        const documentToTabulate = await this.documentViewRepository.findOne(findOptions)
        if (!documentToTabulate) {
            throw new Error(`Cannot find document ${JSON.stringify(documentToTabulate)}`);
        }

        const text = await streamToString(await s3ReadStream(documentToTabulate.filename));
        const atomizedDocument = AtomizedDocument.atomizeDocument(text);
        const tabulation = Segment.tabulate(
            new SetWithUniqueLengths(words),
            atomizedDocument.segments(),
        );
        return {
            wordCounts: tabulation.wordCounts,
            wordSegmentStringsMap: new Map(),
            greedyWordCounts: tabulation.greedyWordCounts
        };
    }
}

function streamToString(stream): Promise<string> {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
}