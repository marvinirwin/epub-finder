import {Manager} from "./lib/Manager";
import {ReplaySubject, Subject} from "rxjs";
import DebugMessage from "./Debug-Message";

import {shutterResult} from "./App";
import {MyAppDatabase} from "./lib/Storage/AppDB";
import {EditingCard} from "./lib/ReactiveClasses/EditingCard";
import {IndexDBManager, LocalStorageManager} from "./lib/Storage/StorageManagers";
import {ICard} from "./lib/Interfaces/ICard";
import {BrowserAudio} from "./lib/Audio/BrowserAudio";

interface Memoizable<T, MemoParamType> {
    getMemo(a: MemoParamType): T | undefined;
    memo(p: T): T
}


interface ImageResult {
    data: shutterResult[]
}


/*
export class EditingCardClass extends EditingCard {
    imageSources: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
    matchChange$: Subject<string> = new Subject<string>()
    constructor(persistor: IndexDBManager<ICard>, public m: Manager) {
        super(persistor, m);
        this.learningLanguage$.subscribe(async v => {
            const o = await queryImages(v, 2)
            const data: shutterResult[] = o.data;
            this.imageSources.next(data.map(d => d.assets.preview.url))
        })
    }
}
*/

export interface AppSingleton {
    m: Manager,
}


export async function initializeApp(): Promise<AppSingleton> {
    const messages$ = new Subject<DebugMessage>();
    const db = new MyAppDatabase();
    const m = new Manager(db, new BrowserAudio());
    return {
        m,
    }
}