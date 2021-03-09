import {Observable, ReplaySubject} from "rxjs";
import {LanguageConfigsService} from "./language-configs.service";
import {wordCardFactory} from "../components/quiz/card-card.factory";
import CardsRepository from "./manager/cards.repository";
import {WordCard} from "../components/quiz/word-card.interface";

export class WordCardModalService {
    word$ = new ReplaySubject<string | undefined>(1);
    wordCard$: WordCard;

    constructor({
                    languageConfigsService,
                    cardService
                }: {
        languageConfigsService: LanguageConfigsService,
        cardService: CardsRepository,
    }) {
        this.wordCard$ = wordCardFactory(
            this.word$,
            cardService,
            languageConfigsService
        );
    }
}