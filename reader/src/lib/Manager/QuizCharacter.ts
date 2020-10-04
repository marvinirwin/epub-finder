import {Observable, ReplaySubject} from "rxjs";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {OpenBook} from "../BookFrame/OpenBook";
import {ds_Dict} from "../Util/DeltaScanner";
import {ICard} from "../Interfaces/ICard";
import {distinct, map, switchMap} from "rxjs/operators";
import {interpolateSourceDoc} from "../Atomized/AtomizedDocumentFromSentences";
import {AtomizedStringsForRawHTML} from "../Pipes/AtomizedStringsForRawHTML";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {ITrie} from "../Interfaces/Trie";
import {TrieWrapper} from "../TrieWrapper";

export type TrieObservable = Observable<TrieWrapper>;

export interface QuizCharacterManagerParams {
    exampleSentences$: Observable<AtomizedSentence[]>,
    quizzingCard$: Observable<ICard | undefined>;
    trie$: TrieObservable;
    requestPlayAudio: (sentence: string) => void;
    applyAtomizedSentenceListeners: (s: AtomizedSentence[]) => void
}

export class QuizCharacter {
    exampleSentences$: Observable<AtomizedSentence[]>;
    quizzingCard$: Observable<ICard | undefined>;
    atomizedSentenceMap$ = new ReplaySubject<ds_Dict<AtomizedSentence>>(1);
    public exampleSentencesBook: OpenBook;

    private sentenceCache = new Set<string>();

    constructor({
                    exampleSentences$,
                    quizzingCard$,
                    trie$,
                    requestPlayAudio,
                    applyAtomizedSentenceListeners
                }: QuizCharacterManagerParams) {
        this.exampleSentences$ = exampleSentences$;
        this.quizzingCard$ = quizzingCard$;
        this.exampleSentencesBook = new OpenBook(
            'ExampleSentences',
            trie$,
            this.exampleSentences$.pipe(
                map(sentences => {
                    return interpolateSourceDoc(sentences.map(sentence => {
                        return sentence.translatableText;
                    }).concat(Array(10).fill('_')));
                }),
                AtomizedStringsForRawHTML,
                map(atomizedStrings => AtomizedDocument.fromAtomizedString(atomizedStrings[0])),
            ),
            undefined,
            applyAtomizedSentenceListeners
        );

        this.quizzingCard$.pipe(
            distinct(card => card?.learningLanguage)
        ).subscribe(() => {
            this.sentenceCache.clear();
        })
    }
}