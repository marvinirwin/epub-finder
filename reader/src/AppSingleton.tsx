import {Manager} from "./lib/Manager";
import {MyAppDatabase} from "./lib/Storage/AppDB";
import {AudioSourceBrowser} from "./lib/Audio/AudioSourceBrowser";
import {getPageRendererWorker} from "./lib/AppContext/GetPageRendererWorker";
import {getPageSrcHttp, Website} from "./lib/Website/Website";

export function getManager(mode: string): Manager {
    const m = new Manager(new MyAppDatabase(), {
        audioSource: new AudioSourceBrowser(),
        getPageRenderer: getPageRendererWorker,
        getPageSrc: getPageSrcHttp
    });

    let websites = [];
    if (mode === 'test') {
        websites.push('test.html');
    } else {
        websites.push(
            '4_modernizations.html',
            'generals.html',
            'zhou_enlai.html'
        )
    }
    websites.forEach(filename => {

        m.bookFrameManager.addOpenBook$.next(new Website(filename, `${process.env.PUBLIC_URL}/books/${filename}`, getPageSrcHttp))
    })
    return m;
}