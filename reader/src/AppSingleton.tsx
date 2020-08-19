import {Manager} from "./lib/Manager";
import {MyAppDatabase} from "./lib/Storage/AppDB";
import {BrowserAudio} from "./lib/Audio/BrowserAudio";
import {WorkerAtomize} from "./lib/AppContext/WorkerAtomize";
import {getSrcHttp, Website} from "./lib/Website/Website";

export function getManager(mode: string): Manager {
    const m = new Manager(new MyAppDatabase(), {
        audioSource: new BrowserAudio(),
        getPageRenderer: WorkerAtomize,
        getPageSrc: getSrcHttp
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

        m.pageManager.addPage$.next(new Website(filename, `${process.env.PUBLIC_URL}/books/${filename}`, getSrcHttp))
    })
    return m;
}