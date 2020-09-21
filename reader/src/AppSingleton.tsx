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
            'why_i_left_china.html',
            'generals.html',
            'zhou_enlai.html',
            'party_1.html',
            '4_modernizations.html',
            'smes.html',
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