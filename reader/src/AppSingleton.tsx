import {Manager} from "./lib/Manager";
import {ReplaySubject, Subject} from "rxjs";
import DebugMessage from "./Debug-Message";

import * as sstk from 'shutterstock-api';
import {shutterResult} from "./App";
import {MyAppDatabase} from "./lib/Storage/AppDB";
import {EditingCard} from "./lib/DisplayClasses/EditingCard";
import {IndexDBManager, LocalStorageManager} from "./lib/Storage/StorageManagers";
import {ICard} from "./lib/Interfaces/ICard";

sstk.setBasicAuth('JyUSD4SSh13Q09D7CXl0eQJ7asvOkPAV', '9AUN4YWTbtcxyd7X');
const api = new sstk.ImagesApi();

interface Memoizable<T, MemoParamType> {
    getMemo(a: MemoParamType): T | undefined;
    memo(p: T): T
}


interface ImageResult {
    data: shutterResult[]
}

export function queryImages(searchString: string, limit: number): Promise<ImageResult> {
    return api.searchImages({
        query: searchString,
        sort: 'relevance',
        per_page: limit
    });
}

export class EditingCardClass extends EditingCard {
    imageSources: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
    matchChange$: Subject<string> = new Subject<string>()
    constructor(persistor: IndexDBManager<ICard>, public m: Manager) {
        super(persistor, m);
        this.characters$.subscribe(async v => {
            const o = await queryImages(v, 2)
            const data: shutterResult[] = o.data;
            this.imageSources.next(data.map(d => d.assets.preview.url))
        })
    }
}

export interface AppSingleton {
    m: Manager,
}


export async function initializeApp(): Promise<AppSingleton> {
    const messages$ = new Subject<DebugMessage>();
    const db = new MyAppDatabase((s: string) => messages$.next(new DebugMessage('database-main', s)));
    const m = new Manager(db);

    return {
        m,
    }
}