import {Inject} from "@nestjs/common";
import {ChineseVocabService} from "../shared/tabulate-documents/chinese-vocab.service";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CardView} from "../entities/card-view.entity";
import {TabulateService} from "../documents/similarity/tabulate.service";

export class CliService {
    constructor(
        @Inject(ChineseVocabService)
        private chineseVocabService: ChineseVocabService,
        @InjectRepository(CardView)
        private cardViewRepository: Repository<CardView>,
        @Inject(TabulateService)
        private tabulateService: TabulateService
    ) {

    }

    async exec() {

        const words = [
            "观察"
        ];

        const sentences = [
            '我观察你'
        ];
        const allFlashCards = await this.cardViewRepository.find();
        const allChineseWords = await ChineseVocabService.vocab();

        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];
            const tabulation = this.tabulateService.tabulate({words: allChineseWords, text: sentence, language_code: 'zh-Hans', documentId: 'test'})
            /**
             * Print a representation of all flash cards applicable to the sentence in the terminal
             * Mark the words
             */
        }
    }
}
