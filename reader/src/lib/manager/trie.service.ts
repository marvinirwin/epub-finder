import { TrieWrapper } from '../util/TrieWrapper'
import trie from 'trie-prefix-tree'
import CardsRepository from './cards.repository'
import { Observable } from 'rxjs'
import { PronunciationProgressRepository } from '../schedule/pronunciation-progress.repository'
import { WordRecognitionProgressRepository } from '../schedule/word-recognition-progress.repository'
import { IndexedRowsRepository } from '../schedule/indexed-rows.repository'
import { AllWordsRepository } from '../language/all-words.repository'
import { SetWithUniqueLengths } from "@shared/"

export class TrieService {
    public trie$: Observable<TrieWrapper>

    constructor({
        cardsRepository,
        pronunciationProgressService,
        wordRecognitionProgressRepository,
        allWordsRepository,
    }: {
        cardsRepository: CardsRepository
        pronunciationProgressService: PronunciationProgressRepository
        wordRecognitionProgressRepository: WordRecognitionProgressRepository
        allWordsRepository: AllWordsRepository
    }) {
        const t = new TrieWrapper(new SetWithUniqueLengths())
        this.trie$ = t.changeSignal$
        cardsRepository.newWords$.subscribe((words) => t.addWords(...words))
        ;[pronunciationProgressService, wordRecognitionProgressRepository].map(
            (progressService: IndexedRowsRepository<any>) =>
                progressService.addRecords$.subscribe((records) => {
                    t.addWords(...records.map((record) => record.word))
                }),
        )
        allWordsRepository.all$.subscribe((words) => t.addWords(...words))
    }
}
