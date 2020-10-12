import { ReplaySubject} from "rxjs";
import {NavigationPages} from "../../Util/Util";
import {IAnnotatedCharacter} from "../../Interfaces/Annotation/IAnnotatedCharacter";
import {AtomizedSentence} from "../../Atomized/AtomizedSentence";
import {TrieObservable} from "../QuizCharacter";
import {MyAppDatabase} from "../../Storage/AppDB";

export interface OpenBooksConfig {
    trie$: TrieObservable,
    applyListeners: (b: HTMLDocument) => void,
    bottomNavigationValue$: ReplaySubject<NavigationPages>,
    applyWordElementListener: (annotationElement: IAnnotatedCharacter) => void;
    applyAtomizedSentencesListener: (sentences: AtomizedSentence[]) => void;
    db: MyAppDatabase;
}
