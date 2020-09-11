import {Manager} from "./lib/Manager";
import {MyAppDatabase} from "./lib/Storage/AppDB";
import {AudioSourceBrowser} from "./lib/Audio/AudioSourceBrowser";
import {NewOpenBook} from "./lib/AppContext/NewOpenBook";
import {getPageSrcHttp, Website} from "./lib/Website/Website";
import {AtomizedStringForURL} from "./lib/Pipes/AtomizedStringForURL";
import {of} from "rxjs";
import {flatMap, map} from "rxjs/operators";

export function getManager(mode: string): Manager {
    const m = new Manager(new MyAppDatabase(), {
        audioSource: new AudioSourceBrowser(),
    });

    let websites = [];
    if (mode === 'test') {
        websites.push('test.html');
    } else {
        websites.push(
            'song_1.html',
        )
    }
    websites.forEach(filename => {
        m.openedBooksManager.addOpenBook$.next(new Website(
            filename,
            `${process.env.PUBLIC_URL}/books/${filename}`
            ))
    })
    return m;
}