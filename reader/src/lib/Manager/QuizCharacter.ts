import {Observable, of, ReplaySubject} from "rxjs";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {ds_Dict} from "../Tree/DeltaScanner";
import {ICard} from "../Interfaces/ICard";
import {distinct, map} from "rxjs/operators";
import {AtomizedStringsForRawHTML} from "../Pipes/AtomizedStringsForRawHTML";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {TrieWrapper} from "../TrieWrapper";
import {InterpolateService} from "@shared/";
import {OpenDocument} from "../DocumentFrame/open-document.entity";

export type TrieObservable = Observable<TrieWrapper>;

export class QuizCharacter {
    exampleSentences$: Observable<AtomizedSentence[]>;
    quizzingCard$: Observable<ICard | undefined>;
    atomizedSentenceMap$ = new ReplaySubject<ds_Dict<AtomizedSentence>>(1);
    public exampleSentencesDocument: OpenDocument;
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

        this.quizzingCard$.pipe(
            distinct(card => card?.learningLanguage)
        ).subscribe(() => {
            this.sentenceCache.clear();
        })
    }
}