import {AudioSourceBrowser} from "../Audio/AudioSourceBrowser";
import {getPageRendererWorker} from "./GetPageRendererWorker";

export class BrowserContext {
    audioSource = new AudioSourceBrowser();
    getPageRenderer = getPageRendererWorker;
}