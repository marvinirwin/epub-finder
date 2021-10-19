import {DocumentSimilarityService} from '../documents/similarity/document-similarity.service'
import {Inject} from '@nestjs/common'
import {ChineseVocabService} from '../shared/tabulate-documents/chinese-vocab.service'
import compareDocuments from "./compare-documents";
import {generateAnkiDeck} from "./generate-anki-deck";

export class CliService {
    constructor(
        @Inject(DocumentSimilarityService)
        private documentSimilarityService: DocumentSimilarityService,
        @Inject(ChineseVocabService)
        private chineseVocabService: ChineseVocabService,
        @Inject()
    ) {}

    async exec(customArgv?: string[]) {
        const customCommand = customArgv[0];
        switch(customCommand) {
            case 'compareDocuments':
                compareDocuments(customArgv);
            case 'generateAnki':
                generateAnkiDeck(customArgv);
            default:
                throw new Error(`Unknown command ${customCommand}`)
        }
    }
}
