import {Observable, ReplaySubject} from "rxjs";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {OpenDocument} from "../DocumentFrame/OpenDocument";
import {ds_Dict} from "../Tree/DeltaScanner";
import {ICard} from "../Interfaces/ICard";
import {distinct, map} from "rxjs/operators";
import {AtomizedStringsForRawHTML} from "../Pipes/AtomizedStringsForRawHTML";
import {AtomizedDocument} from "../Atomized/ERROR_DOCUMENT";
import {TrieWrapper} from "../TrieWrapper";
import { InterpolateService } from "@shared/";

export type TrieObservable = Observable<TrieWrapper>;

export interface QuizCharacterManagerParams {
    exampleSentences$: Observable<AtomizedSentence[]>,
    quizzingCard$: Observable<ICard | undefined>;
    trie$: TrieObservable;
}

export class QuizCharacter {
    exampleSentences$: Observable<AtomizedSentence[]>;
    quizzingCard$: Observable<ICard | undefined>;
    atomizedSentenceMap$ = new ReplaySubject<ds_Dict<AtomizedSentence>>(1);
    public exampleSentencesDocument: OpenDocument;
    public recordingClass$ = new ReplaySubject<string>(1);
    private sentenceCache = new Set<string>();

    constructor({
                    exampleSentences$,
                    quizzingCard$,
                    trie$,
                }: QuizCharacterManagerParams) {
        this.atomizedSentenceMap$.next({})
        this.exampleSentences$ = exampleSentences$;
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