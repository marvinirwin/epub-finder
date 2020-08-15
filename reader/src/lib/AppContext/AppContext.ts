import {AudioSource} from "../Audio/AudioSource";
import {WorkerAtomize} from "./WorkerAtomize";
import {Observable} from "rxjs";
import {BookFrame} from "../BookFrame/BookFrame";
import {Website} from "../Website/Website";

export interface AppContext {
    audioSource: AudioSource;
    getPageRenderer: (website: Website) => Observable<BookFrame>;
    getPageSrc: (url: string) => Observable<string>
}