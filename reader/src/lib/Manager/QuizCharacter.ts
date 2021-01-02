import {Observable, of, ReplaySubject} from "rxjs";
import {Segment} from "../Atomized/segment";
import {ds_Dict} from "../Tree/DeltaScanner";
import {ICard} from "../Interfaces/ICard";
import {distinct, map} from "rxjs/operators";
import {TrieWrapper} from "../TrieWrapper";

export type TrieObservable = Observable<TrieWrapper>;

export class QuizCharacter {
    exampleSentences$: Observable<Segment[]>;
    quizzingCard$: Observable<ICard | undefined>;
    atomizedSentenceMap$ = new ReplaySubject<ds_Dict<Segment>>(1);
    public recordingClass$ = new ReplaySubject<string>(1);
    private sentenceCache = new Set<string>();

    constructor({
                    quizzingCard$,
                    trie$,
                }: {
        quizzingCard$: Observable<ICard | undefined>;
        trie$: TrieObservable;
    }) {
        this.atomizedSentenceMap$.next({})
        this.exampleSentences$ = of([]);
        this.quizzingCard$ = quizzingCard$;
/*
        this.exampleSentencesDocument = new OpenDocument(
            'ExampleSentences',
            trie$,
            this.exampleSentences$.pipe(
                map(sentences => {
                    return InterpolateService.sentences(sentences.map(sentence => {
                        return sentence.translatableText;
                    }).concat(Array(10).fill('_')));
                }),
                AtomizedStringsForRawHTML,
                map(atomizedStrings => AtomizedDocument.fromAtomizedString(atomizedStrings[0])),
            ),
        );
*/

        this.quizzingCard$.pipe(
            distinct(card => card?.learningLanguage)
        ).subscribe(() => {
            this.sentenceCache.clear();
        })
    }
}