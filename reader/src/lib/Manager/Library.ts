import {BehaviorSubject, Observable, ReplaySubject} from "rxjs";
import {DeltaScanner, ds_Dict} from "../Util/DeltaScanner";
import {CustomDocument, Website} from "../Website/Website";
import {MyAppDatabase} from "../Storage/AppDB";

export class EditingBook {
    text$ = new ReplaySubject<string>(1);
    name$ = new ReplaySubject<string>(1);
}

interface LibraryParams {
    db: MyAppDatabase
}

export function Delta<T>(key: string, value?: T, ) {
    return {
        children: {
        },
        nodeLabel: key,
    }
}

export class Library {
    builtInBooks$ = new DeltaScanner<Website>();
    customBooks$ = new DeltaScanner<CustomDocument>();

    rawBook$ = new EditingBook();
    simpleBook$ = new EditingBook();
    db: MyAppDatabase;

    constructor({db}: LibraryParams) {
        this.db = db;
    }

    async loadDocuments() {
        const docs = await this.db.customDocuments.offset(0);
        this.builtInBooks$.appendDelta$.next({
            children: {

            },
            nodeLabel: 'root',
        })
    }

}