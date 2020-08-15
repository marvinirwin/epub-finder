import {BrowserAudio} from "../Audio/BrowserAudio";
import {WorkerAtomize} from "./WorkerAtomize";

export class BrowserContext {
    audioSource = new BrowserAudio();
    getPageRenderer = WorkerAtomize;
}