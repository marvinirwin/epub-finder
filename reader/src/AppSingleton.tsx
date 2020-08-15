import {Manager} from "./lib/Manager";

import {MyAppDatabase} from "./lib/Storage/AppDB";
import {BrowserAudio} from "./lib/Audio/BrowserAudio";
import {WorkerAtomize} from "./lib/AppContext/WorkerAtomize";
import {getSrcHttp} from "./lib/Website/Website";

interface Memoizable<T, MemoParamType> {
    getMemo(a: MemoParamType): T | undefined;
    memo(p: T): T
}

export function getManager(mode: string): Manager {
    const m =  new Manager(new MyAppDatabase(), {
        audioSource: new BrowserAudio(),
        getPageRenderer: WorkerAtomize,
        getPageSrc: getSrcHttp
    });

    if (mode !== 'test') {
        // Load the test document
    } else {
        // Load the real documents
        // We may even choose to load a different db, or load only n cards instead of them all, for profiling purposes
    }
    return m;
}