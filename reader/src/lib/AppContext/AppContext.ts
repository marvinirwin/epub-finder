import {AudioSource} from "../Audio/AudioSource";
import {TrieObservable, WorkerGetBookRenderer} from "./WorkerGetBookRenderer";
import {Observable} from "rxjs";
import {OpenBook} from "../BookFrame/OpenBook";
import {Website} from "../Website/Website";
import {TrieWrapper} from "../TrieWrapper";

export interface AppContext {
    audioSource: AudioSource;
    getPageRenderer: (
        website: Website,
        trie$: TrieObservable
    ) => Observable<OpenBook>;
    getPageSrc: (url: string) => Observable<string>
}