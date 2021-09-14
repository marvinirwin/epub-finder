import { InjectRepository } from '@nestjs/typeorm'
import { DocumentView } from '../../entities/document-view.entity'
import { FindOneOptions, Repository } from 'typeorm'
import { s3ReadStream } from '../uploading/s3.service'
import { AtomizedDocument, SerializedTabulation, tabulate } from '../../shared'
import { CacheService } from '../../util/cache.service'
import { Inject } from '@nestjs/common'
import { SetWithUniqueLengths } from '../../shared/tabulate-documents/set-with-unique-lengths'
import { resolvePartialTabulationConfig } from '../../shared/tabulation/word-separator'

export class TabulateService {
    constructor(
        @InjectRepository(DocumentView)
        private documentViewRepository: Repository<DocumentView>,
        @Inject(CacheService)
        private cacheService: CacheService,
    ) {}

    async tabulate(
        findOptions: FindOneOptions<DocumentView>,
        words: string[],
        language_code: string,
    ): Promise<SerializedTabulation> {
        return this.cacheService.memo<SerializedTabulation>({
            args: [findOptions, words],
            service: 'TABULATE',
            cb: async () => {
                return await this.tabulateNoCache(
                    findOptions,
                    words,
                    language_code,
                )
            },
        })
    }

    async tabulateNoCache(
        findOptions: FindOneOptions<DocumentView>,
        words: string[],
        language_code: string,
    ) {
        const documentToTabulate = await this.documentViewRepository.findOne(
            findOptions,
        )
        if (!documentToTabulate) {
            throw new Error(
                `Cannot find document ${JSON.stringify(documentToTabulate)}`,
            )
        }

        const text = await streamToString(
            await s3ReadStream(documentToTabulate.filename),
        )
        const atomizedDocument = AtomizedDocument.atomizeDocument({
            documentSrc: text,
            documentId: documentToTabulate.document_id || documentToTabulate.id
        })
        const setWithUniqueLengths = new SetWithUniqueLengths(words)
        return tabulate({
            notableCharacterSequences: setWithUniqueLengths,
            segments: atomizedDocument.segments(),
            greedyWordSet: setWithUniqueLengths,
            ...resolvePartialTabulationConfig(language_code),
            language_code,
        })
        /*
        return {
            wordCounts: tabulation.wordCounts,
            wordSegmentStringsMap: new Map(),
            greedyWordCounts: tabulation.greedyWordCounts,
            segmentWordCountRecordsMap
        };
*/
    }
}

function streamToString(stream): Promise<string> {
    const chunks = []
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk))
        stream.on('error', (err) => reject(err))
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
}
