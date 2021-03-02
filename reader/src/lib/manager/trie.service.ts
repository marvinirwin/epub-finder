import {TrieWrapper} from "../TrieWrapper";
import trie from "trie-prefix-tree";
import CardsRepository from "./cards.repository";
import {Observable} from "rxjs";
import {PronunciationProgressRepository} from "../schedule/pronunciation-progress.repository";
import {WordRecognitionProgressRepository} from "../schedule/word-recognition-progress.repository";
import {IndexedRowsRepository} from "../schedule/indexed-rows.repository";
import {AllWordsRepository} from "../all-words.repository";
import {SetWithUniqueLengths} from "../../../../server/src/shared/tabulate-documents/set-with-unique-lengths";

export class TrieService {
    public trie$: Observable<TrieWrapper>;

    constructor(
        {
            cardsRepository,
            pronunciationProgressService,
            wordRecognitionProgressService,
            allWordsRepository
        }: {
            cardsRepository: CardsRepository,
            pronunciationProgressService: PronunciationProgressRepository,
            wordRecognitionProgressService: WordRecognitionProgressRepository,
            allWordsRepository: AllWordsRepository
        }
    ) {
        const t = new TrieWrapper(new SetWithUniqueLengths());
        this.trie$ = t.changeSignal$;
        cardsRepository.newWords$.subscribe(words => t.addWords(...words));
        cardsRepository.deleteWords.subscribe(words => t.removeWords(...words));
        [
            pronunciationProgressService,
            wordRecognitionProgressService
        ].map((progressService: IndexedRowsRepository<any>) =>
            progressService.addRecords$.subscribe(records => {
                t.addWords(...records.map(record => record.word));
            })
        )
        allWordsRepository.all$.subscribe(words => t.addWords(...words))

    }
}