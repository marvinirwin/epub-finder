import {InjectRepository} from "@nestjs/typeorm";
import {DocumentView} from "../../entities/document-view.entity";
import {FindOneOptions, Repository} from "typeorm";
import {s3ReadStream} from "../uploading/s3.service";
import {AtomizedDocument, Segment, SerializedTabulation} from "../../shared";
import {ITrie} from "../../../../reader/src/lib/interfaces/Trie";
import trie from "trie-prefix-tree";
import {JsonCache} from "../../entities/json-cache.entity";
import {sha1} from "../../util/sha1";


export class TabulateService {
    _service: "TABULATE"
    constructor(
        @InjectRepository(DocumentView)
        private documentViewRepository: Repository<DocumentView>,
        @InjectRepository(JsonCache)
        private jsonCacheRepository: Repository<JsonCache>,
    ) {
    }

    async tabulate(findOptions: FindOneOptions<DocumentView>, words: string[]): Promise<SerializedTabulation> {
        const key = [findOptions, words];
        const keyHash = sha1(key);
        const tabulationCacheEntry = await this.jsonCacheRepository.findOne({
            service: this._service,
            key_hash: keyHash
        });
        if (tabulationCacheEntry) {
            return JSON.parse(tabulationCacheEntry.value) as SerializedTabulation
        }
        console.log(`tabulate cache miss ${JSON.stringify(findOptions)}`);

        const documentToTabulate = await this.documentViewRepository.findOne(findOptions)
        if (!documentToTabulate) {
            throw new Error(`Cannot find document ${JSON.stringify(documentToTabulate)}`);
        }

        const text = await streamToString(await s3ReadStream(documentToTabulate.filename));
        const atomizedDocument = AtomizedDocument.atomizeDocument(text);
        const tabulation = Segment.tabulate(
            trie(words),
            atomizedDocument.segments(),
        );
        const serializedTabulation = {
            wordCounts: tabulation.wordCounts
        }
        await this.jsonCacheRepository.insert({
            key: JSON.stringify(key),
            service: this._service,
            key_hash: keyHash,
            value: JSON.stringify(serializedTabulation),
        })
        return serializedTabulation;
    }

}

function streamToString (stream): Promise<string> {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
}