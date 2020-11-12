import {Observable, ReplaySubject} from "rxjs";
import {NavigationPages} from "../../Util/Util";
import {IAnnotatedCharacter} from "../../Interfaces/Annotation/IAnnotatedCharacter";
import {AtomizedSentence} from "../../Atomized/AtomizedSentence";
import {TrieObservable} from "../QuizCharacter";
import {MyAppDatabase} from "../../Storage/AppDB";
import {ds_Dict} from "../../Tree/DeltaScanner";
import {CustomDocument, Website} from "../../Website/Website";

export interface OpenBooksConfig {
    trie$: TrieObservable,
    applyListeners: (b: HTMLDocument) => void,
    bottomNavigationValue$: ReplaySubject<NavigationPages>,
    applyWordElementListener: (annotationElement: IAnnotatedCharacter) => void;
    applyAtomizedSentencesListener: (sentences: AtomizedSentence[]) => void;
    db: MyAppDatabase;
    library$: Observable<ds_Dict<CustomDocument | Website>>
}
