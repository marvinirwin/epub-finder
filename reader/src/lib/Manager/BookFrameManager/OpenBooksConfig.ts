import {Website} from "../../Website/Website";
import {Observable, ReplaySubject} from "rxjs";
import {OpenBook} from "../../BookFrame/OpenBook";
import {TrieWrapper} from "../../TrieWrapper";
import {TrieObservable} from "../../AppContext/WorkerGetBookRenderer";
import {NavigationPages} from "../../Util/Util";

export interface OpenBooksConfig {
    getPageRenderer: (website: Website, trie$: Observable<TrieWrapper>) => Observable<OpenBook>,
    trie$: TrieObservable,
    applyListeners: (b: HTMLBodyElement) => void,
    bottomNavigationValue$: ReplaySubject<NavigationPages>
}
