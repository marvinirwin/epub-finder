// @ts-ignore Workers don't have the window object
import {AnkiPackage, loadAnkiPackageFromFile} from "../../Anki";
import {buffer, filter, map, last} from "rxjs/operators";
import {Subject, BehaviorSubject, from, Observable, combineLatest} from "rxjs";
import {invert, Dictionary} from "lodash";
import initSqlJs from "sql.js";
// @ts-ignore
import JSZip from 'jszip';
// @ts-ignore
import {getBinaryContent} from 'jszip-utils';
import {Card} from "./Card";
import {Collection} from "./Collection";

// @ts-ignore
// noinspection JSConstantReassignment
self.window = self;
// @ts-ignore
const ctx: Worker = self as any;


class Loader {
    packages: AnkiPackage[] = [];
    constructor() {
    }
    async loadPackage(name: string, path: string) {
    }
}

export interface AnkiPackageSerialized {
    name: string
    path: string
    message: string
    collections: Collection[];
    cardIndex: Dictionary<Card[]>
}

class AnkiPackageLoader {
    ankiPackageLoaded: Observable<AnkiPackage>;
    loadingCheckpoints: Subject<string> = new Subject<string>();
    constructor(public name: string, public path: string) {
        this.ankiPackageLoaded = from(this.loadAnkiPackageFromFile());
        combineLatest(this.ankiPackageLoaded, this.loadingCheckpoints)
            .subscribe(([ankiPackage, message]: [AnkiPackage, string | undefined]) => {
            ctx.postMessage(JSON.stringify({
                collections: ankiPackage ? ankiPackage.collections : null,
                cardIndex: ankiPackage ? ankiPackage.cardMap : null,
                message,
                name: this.name,
                path: this.path
            }))
        })
    }
    loadAnkiPackageFromFile(): Promise<AnkiPackage> {
        return new Promise((resolve, reject) => {
            this.loadingCheckpoints.next(`Loading ${this.name}`)
            getBinaryContent(this.path, async (err: boolean | Error, data: any) => {
                if (err) {
                    this.loadingCheckpoints.next(`Error loading anki package binary file ${err}`);
                    reject(err);
                }
                this.loadingCheckpoints.next('Unzipping Anki Archive')
                const v = await JSZip.loadAsync(data);
                this.loadingCheckpoints.next(`Loading SQLite file`)
                const ankiDatabaseBinary = await v.files['collection.anki2'].async('uint8array');
                this.loadingCheckpoints.next(`Loading media file`)
                const mediafile: { [key: string]: string } = invert(JSON.parse(await v.files['media'].async('text')));
                this.loadingCheckpoints.next(`Initializing SQLite database`)
                const SQL = await initSqlJs();
                var db = new SQL.Database(ankiDatabaseBinary);
                this.loadingCheckpoints.next(`Interpolating and indexing cards`)
                resolve(await AnkiPackage.init(db, v, mediafile));
            });
        })
    }

}

const loaders: AnkiPackageLoader[] = [];
// Respond to message from parent thread
ctx.onmessage = (ev) => {
    let {name, path}: {name: string, path: string} = JSON.parse(ev.data);
    const l = new AnkiPackageLoader(name, path);
};

