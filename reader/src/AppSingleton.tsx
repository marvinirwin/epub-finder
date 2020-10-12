import {Manager} from "./lib/Manager";
import {MyAppDatabase} from "./lib/Storage/AppDB";
import {AudioSourceBrowser} from "./lib/Audio/AudioSourceBrowser";
import {Website} from "./lib/Website/Website";

export function websiteFromFilename(filename: string) {
    return new Website(
        filename,
        `${process.env.PUBLIC_URL}/books/${filename}`
    );
}

export function getManager(mode: string): Manager {
    return new Manager(new MyAppDatabase(), {
        audioSource: new AudioSourceBrowser(),
    });
}