import { Observable, ReplaySubject } from 'rxjs'
import { LanguageConfigsService } from '../language/language-configs.service'
import { wordCardFactory } from '../../components/quiz/card-card.factory'
import CardsRepository from '../manager/cards.repository'
import { WordCard } from '../../components/quiz/word-card.interface'
import { ModalService } from '../user-interface/modal.service'
import {DictionaryService} from "../dictionary/dictionary.service";

export class WordCardModalService {
    word$ = new ReplaySubject<string | undefined>(1)
    wordCard$: WordCard

    constructor({
        languageConfigsService,
        cardsRepository,
        modalService,
        dictionaryService
    }: {
        languageConfigsService: LanguageConfigsService
        cardsRepository: CardsRepository
        modalService: ModalService
        dictionaryService: DictionaryService
    }) {
        this.wordCard$ = wordCardFactory(
            this.word$,
            cardsRepository,
            languageConfigsService,
            dictionaryService
        )
        this.word$.subscribe((word) => {
            modalService.wordPaperDisplay.open$.next(!!word)
        })
    }
}
