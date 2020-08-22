import {AudioSourceBrowser} from "../Audio/AudioSourceBrowser";
import {WorkerGetBookRenderer} from "./WorkerGetBookRenderer";

export class BrowserContext {
    audioSource = new AudioSourceBrowser();
    getPageRenderer = WorkerGetBookRenderer;
}