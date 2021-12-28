import {DocumentSimilarityService} from '../documents/similarity/document-similarity.service'
import {Inject} from '@nestjs/common'
import {ChineseVocabService} from '../shared/tabulate-documents/chinese-vocab.service'
import {InjectRepository} from "@nestjs/typeorm";
import {VideoMetadata} from "../entities/video.metadata";
import {Repository} from "typeorm";
import {CardView} from "../entities/card-view.entity";

export class CliService {
    constructor(
        @Inject(ChineseVocabService)
        private chineseVocabService: ChineseVocabService,
        @InjectRepository(CardView)
        private cardViewRepository: Repository<CardView>,
    ) {

    }

    async exec(customArgv?: string[]) {
/*
        switch(customCommand) {
            case 'compareDocuments':
                compareDocuments(customArgv);
            case 'generateAnki':
                generateAnkiDeck(customArgv);
            default:
                throw new Error(`Unknown command ${customCommand}`)
        }
*/
    }
}
