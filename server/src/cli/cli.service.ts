import {Inject} from "@nestjs/common";
import {ChineseVocabService} from "../shared/tabulate-documents/chinese-vocab.service";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CardView} from "../entities/card-view.entity";
import {TabulateService} from "../documents/similarity/tabulate.service";

import doGoogleOcr from "../text-extraction/oct";

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
        const sentences = [(await doGoogleOcr( "C:\\Users\\marvi\\Downloads\\chinese.jpg")).join("\n")];

        const flashcardDictionary = {};
        const allFlashCards = await this.cardViewRepository.find({});
        // Now we have a dictionary of flash crds
        allFlashCards.forEach(flashCard => {
            flashcardDictionary[flashCard.learning_language] = flashCard;
        });
        sentences.forEach(sentence =>{
            const tabulation = sentence.split(""); /*this.tabulateService.tabulate({words: allChineseWords, text: sentence, language_code: "zh-Hans", documentId: "test"});*/
            const matched = new Set<CardView>();
            const unmatched = new Set<string>();
            tabulation.forEach(tabulatedElement => {
                const foundFlashCard = flashcardDictionary[tabulatedElement];
                if (foundFlashCard) {
                    matched.add(foundFlashCard);
                } else {
                    unmatched.add(tabulatedElement);
                }
            });
            Array.from(matched)
                .forEach(foundFlashCard =>
                    console.log(`${foundFlashCard.learning_language} ${foundFlashCard.photos.join(", ")}`));
            
            console.log(`Words with no flash cards: ${Array.from(unmatched).join(", ")}`);
        });





    }
}
