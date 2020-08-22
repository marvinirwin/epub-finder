import {AudioSource} from "../Audio/AudioSource";
import {WorkerGetBookRenderer} from "./WorkerGetBookRenderer";
import {Observable} from "rxjs";
import {OpenBook} from "../BookFrame/OpenBook";
import {Website} from "../Website/Website";

export interface AppContext {
    audioSource: AudioSource;
    getPageRenderer: (website: Website) => Observable<OpenBook>;
    getPageSrc: (url: string) => Observable<string>
}