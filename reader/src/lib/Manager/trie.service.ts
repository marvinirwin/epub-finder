import {TrieWrapper} from "../TrieWrapper";
import trie from "trie-prefix-tree";
import CardsService from "./cards.service";
import {Observable} from "rxjs";
import {PronunciationProgressService} from "../schedule/pronunciation-progress.service";
import {WordRecognitionProgressService} from "../schedule/word-recognition-progress.service";
import {ProgressRowService} from "../schedule/progress-row.service";

export class TrieService {
    public trie$: Observable<TrieWrapper>;

    constructor(
        {
            cardsService,
            pronunciationProgressService,
            wordRecognitionProgressService
        }: {
            cardsService: CardsService,
            pronunciationProgressService: PronunciationProgressService,
            wordRecognitionProgressService: WordRecognitionProgressService
        }
    ) {
        const t = new TrieWrapper(trie([]));
        this.trie$ = t.changeSignal$;
        cardsService.newWords$.subscribe(words => t.addWords(...words));
        cardsService.deleteWords.subscribe(words => t.removeWords(...words));
        [
            pronunciationProgressService,
            wordRecognitionProgressService
        ].map((progressService: ProgressRowService<any>) =>
            progressService.addRecords$.subscribe(records => {
                t.addWords(...records.map(record => record.word));
            })
        )

    }
}