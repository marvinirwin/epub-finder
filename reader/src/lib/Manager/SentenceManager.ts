import {combineLatest, Observable, Subject} from "rxjs";
import {map, scan} from "rxjs/operators";
import { Dictionary } from "lodash";

export class SentenceManager {
    /**
     * [bookName: string]: {
     *     [word: string]: Set<sentence>;
     * }
      */
    setenceSetIndex$ = new Subject<Dictionary<Dictionary<Set<string>>>>();
    sentenceSet$: Observable<Dictionary<Set<string>>>;
    constructor() {
        this.sentenceSet$ = this.setenceSetIndex$.pipe(
            map((bookDict: Dictionary<Dictionary<Set<string>>>) => {
                const wordSentenceDictionary: Dictionary<Set<string>> = {};
                Object.values(bookDict)
                    .forEach(set => Object.entries(set)
                        .forEach(([word, set]) => {
                            if (!wordSentenceDictionary[word]) {
                                wordSentenceDictionary[word] = new Set<string>(set);
                            } else {
                                let sentenceSet = wordSentenceDictionary[word];
                                set.forEach(setSentence => sentenceSet.add(setSentence));
                            }
                        }))
                return wordSentenceDictionary;
            })
        );

        // Now if you want to get sentences for a word you just have to ask the set
    }
}