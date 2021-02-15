import {Manager} from "./lib/Manager";
import {DatabaseService} from "./lib/Storage/database.service";
import {BrowserAudio} from "./lib/audio/browser.audio";
import {Website} from "./lib/Website/Website";

export function websiteFromFilename(filename: string) {
    return new Website(
        filename.split('.')[0],
        `${process.env.PUBLIC_URL}/documents/${filename}`
    );
}

export function getManager(mode: string): Manager {
    return new Manager(new DatabaseService(), {
        audioSource: new BrowserAudio(),
    });
}