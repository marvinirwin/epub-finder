import {Website} from "../../Website/Website";
import {Observable} from "rxjs";
import {OpenBook} from "../../BookFrame/OpenBook";
import {TrieWrapper} from "../../TrieWrapper";
import {TrieObservable} from "../../AppContext/WorkerGetBookRenderer";

export interface BookFrameManagerConfig {
    getPageRenderer: (website: Website, trie$: Observable<TrieWrapper>) => Observable<OpenBook>,
    trie$: TrieObservable
}
