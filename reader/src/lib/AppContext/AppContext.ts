import {AudioSource} from "../Audio/AudioSource";
import {TrieObservable, NewOpenBook} from "./NewOpenBook";
import {Observable} from "rxjs";
import {OpenBook} from "../BookFrame/OpenBook";
import {Website} from "../Website/Website";
import {TrieWrapper} from "../TrieWrapper";

export interface AppContext {
    audioSource: AudioSource;
}