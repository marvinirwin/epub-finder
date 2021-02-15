import {TrieWrapper} from "../TrieWrapper";
import trie from "trie-prefix-tree";
import CardsRepository from "./cards.repository";
import {Observable} from "rxjs";
import {PronunciationProgressRepository} from "../schedule/pronunciation-progress.repository";
import {WordRecognitionProgressRepository} from "../schedule/word-recognition-progress.repository";
import {IndexedRowsRepository} from "../schedule/indexed-rows.repository";

export class TrieService {
    public trie$: Observable<TrieWrapper>;

    constructor(
        {
            cardsService,
            pronunciationProgressService,
            wordRecognitionProgressService
        }: {
            cardsService: CardsRepository,
            pronunciationProgressService: PronunciationProgressRepository,
            wordRecognitionProgressService: WordRecognitionProgressRepository
        }
    ) {
        const t = new TrieWrapper(trie([]));
        this.trie$ = t.changeSignal$;
        cardsService.newWords$.subscribe(words => t.addWords(...words));
        cardsService.deleteWords.subscribe(words => t.removeWords(...words));
        [
            pronunciationProgressService,
            wordRecognitionProgressService
        ].map((progressService: IndexedRowsRepository<any>) =>
            progressService.addRecords$.subscribe(records => {
                t.addWords(...records.map(record => record.word));
            })
        )

    }
}