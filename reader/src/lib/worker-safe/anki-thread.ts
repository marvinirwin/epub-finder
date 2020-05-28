/* eslint no-restricted-globals: 0 */
// @ts-ignore Workers don't have the window object
import {AnkiPackage} from "../../Anki";
import {Subject} from "rxjs";
import {invert} from "lodash";
import initSqlJs from "sql.js";
// @ts-ignore
import JSZip from 'jszip';
// @ts-ignore
import {getBinaryContent} from 'jszip-utils';
import {SerializedAnkiPackage} from "./SerializedAnkiPackage";

// noinspection JSConstantReassignment
// @ts-ignore
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

class AnkiPackageLoader {
    ankiPackageLoaded$: Subject<SerializedAnkiPackage> = new Subject<SerializedAnkiPackage>();

    postObject(o: Partial<SerializedAnkiPackage>) {
        this.ankiPackageLoaded$.next(Object.assign({
            collections: null,
            cardIndex: null,
            message: '',
            name: this.name,
            path: this.path
        }, o));
    }
    constructor(public name: string, public path: string) {
        this.loadAnkiPackageFromFile().then(p => {
            this.postObject({
                collections: p.collections,
                cardIndex: p.cardIndex,
            })
        });

        this.ankiPackageLoaded$.subscribe((p: SerializedAnkiPackage) => {
            const str = JSON.stringify(p)
                ctx.postMessage(` this.recieveSerializedPackage(${str})`)
            })
    }
    sendMessage(m: string) {
        this.postObject({message: m});
    }


    loadAnkiPackageFromFile(): Promise<AnkiPackage> {
        return new Promise((resolve, reject) => {
            this.sendMessage(`Loading ${this.name}`);
            getBinaryContent(this.path, async (err: boolean | Error, data: any) => {
                if (err) {
                    this.sendMessage(`Error loading anki package binary file ${err}`);
                    reject(err);
                }
                this.sendMessage('Unzipping Anki Archive')
                const v = await JSZip.loadAsync(data);
                this.sendMessage(`Loading SQLite file`)
                const ankiDatabaseBinary = await v.files['collection.anki2'].async('uint8array');
                this.sendMessage(`Loading media file`)
                const mediafile: { [key: string]: string } = invert(JSON.parse(await v.files['media'].async('text')));
                this.sendMessage(`Initializing SQLite database`)
                const SQL = await initSqlJs();
                var db = new SQL.Database(ankiDatabaseBinary);
                this.sendMessage(`Interpolating and indexing cards`)
                resolve(await AnkiPackage.init(db, v, mediafile, s => this.sendMessage(s)));
            });
        })
    }

}

const loaders: AnkiPackageLoader[] = [];
// Respond to message from parent thread
ctx.onmessage = (ev) => {
    let {name, path}: { name: string, path: string } = JSON.parse(ev.data);
    try {
        const l = new AnkiPackageLoader(name, path);

    } catch (e) {
        console.error(e);
    }
};

