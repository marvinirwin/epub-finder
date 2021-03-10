import {Observable, ReplaySubject} from "rxjs";
import {LanguageConfigsService} from "./language-configs.service";
import {wordCardFactory} from "../components/quiz/card-card.factory";
import CardsRepository from "./manager/cards.repository";
import {WordCard} from "../components/quiz/word-card.interface";
import {ModalService} from "./modal.service";

export class WordCardModalService {
    word$ = new ReplaySubject<string | undefined>(1);
    wordCard$: WordCard;

    constructor({
                    languageConfigsService,
                    cardsRepository,
                    modalService
                }: {
        languageConfigsService: LanguageConfigsService,
        cardsRepository: CardsRepository,
        modalService: ModalService
    }) {
        this.wordCard$ = wordCardFactory(
            this.word$,
            cardsRepository,
            languageConfigsService
        );
        this.word$.subscribe(word => {
            modalService.wordPaperDisplay.open$.next(!!word);
        })
    }
}