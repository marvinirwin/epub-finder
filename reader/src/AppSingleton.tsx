import {Manager} from "./lib/Manager";
import {MyAppDatabase} from "./lib/Storage/AppDB";
import {AudioSourceBrowser} from "./lib/Audio/AudioSourceBrowser";
import {getPageSrcHttp, Website} from "./lib/Website/Website";

export function getManager(mode: string): Manager {
    const m = new Manager(new MyAppDatabase(), {
        audioSource: new AudioSourceBrowser(),
    });

    let websites = [];
    if (mode === 'test') {
        websites.push('test.html');
    } else {
        websites.push(
            'guardian_angel.html',
        )
    }
    websites.forEach(filename => {
        m.openedBooks.addOpenBook$.next(new Website(
            filename,
            `${process.env.PUBLIC_URL}/books/${filename}`
            ))
    })
    return m;
}