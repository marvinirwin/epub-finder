import {Manager} from "./lib/Manager";
import {MyAppDatabase} from "./lib/Storage/AppDB";
import {AudioSourceBrowser} from "./lib/Audio/AudioSourceBrowser";
import {WorkerGetBookRenderer} from "./lib/AppContext/WorkerGetBookRenderer";
import {getPageSrcHttp, Website} from "./lib/Website/Website";

export function getManager(mode: string): Manager {
    const m = new Manager(new MyAppDatabase(), {
        audioSource: new AudioSourceBrowser(),
        getPageRenderer: WorkerGetBookRenderer,
        getPageSrc: getPageSrcHttp
    });

    let websites = [];
    if (mode === 'test') {
        websites.push('test.html');
    } else {
        websites.push(
            'generals.html',
        )
    }
    websites.forEach(filename => {

        m.openedBooksManager.addOpenBook$.next(new Website(filename, `${process.env.PUBLIC_URL}/books/${filename}`, getPageSrcHttp))
    })
    return m;
}