/* eslint no-restricted-globals: 0 */
// @ts-ignore Workers don't have the window object
import {AnkiPackage} from "../../Anki";
import {ReplaySubject, Subject} from "rxjs";
import {invert, flatten, chunk} from "lodash";
import initSqlJs from "sql.js";
// @ts-ignore
import JSZip from 'jszip';
// @ts-ignore
import {getBinaryContent} from 'jszip-utils';
import {SerializedAnkiPackage} from "./SerializedAnkiPackage";
import {MyAppDatabase} from "../../AppDB";
import {groupBy} from "rxjs/operators";
import {Card} from "./Card";
import DebugMessage from "../../Debug-Message";
import {ICard} from "./icard";

// noinspection JSConstantReassignment
// @ts-ignore
self.window = self;
// @ts-ignore
const ctx: Worker = self as any;

class AnkiPackageLoader {
    messages$: ReplaySubject<DebugMessage> = new ReplaySubject<DebugMessage>();
    ankiPackageLoaded$: Subject<SerializedAnkiPackage> = new Subject<SerializedAnkiPackage>();

    sendCards(c: ICard[]) {
        ctx.postMessage(
            `this.addCards$.next(${JSON.stringify(c)})`
        )
    }

    postObject(o: Partial<SerializedAnkiPackage>) {
        this.ankiPackageLoaded$.next(Object.assign({
            message: '',
            name: this.name,
            path: this.path,
            collections: undefined,
            cardIndex: undefined,
            cards: undefined
        }, o));
    }

    constructor(public name: string, public path: string, public db: MyAppDatabase) {
        db.messages$.subscribe(m => {
            this.messages$.next(new DebugMessage('worker-database', m));
        });
        this.messages$.subscribe(s => ctx.postMessage(`
            this.receiveDebugMessage(${JSON.stringify(s)});
        `));
        (async () => {
            let cards = await this.getCards(name);
            this.sendMessage(`Adding ${cards.length} cards to indexDB`)
            await this.sendCardsToMainThread(cards, 100);
        })()

        this.ankiPackageLoaded$.subscribe((p: SerializedAnkiPackage) => {
            const str = JSON.stringify(p)
            ctx.postMessage(` this.receiveSerializedPackage(${str})`)
        })
    }

    private async persistCards(cards: ICard[], chunkSize: number) {
        const cardChunks = chunk(cards, chunkSize);
        for (let i = 0; i < cardChunks.length; i++) {
            const cardChunk = cardChunks[i];
            this.sendMessage(`Persisted ${i * chunkSize} so far...`)
            await this.db.cards.bulkAdd(cardChunk);
        }
        this.sendMessage(`Persisted ${cards.length} to indexDB `)
    }

    private async sendCardsToMainThread(cards: ICard[], chunkSize: number) {
        const cardChunks = chunk(cards, chunkSize);
        for (let i = 0; i < cardChunks.length; i++) {
            const cardChunk = cardChunks[i];
            this.sendMessage(`Sent ${i * chunkSize} so far...`)
            this.sendCards(cardChunk);
        }
        this.sendMessage(`Sent ${cards.length} over`)
    }

    private async getCards(name: string) {
        const chunkSize = 100;
        let cards = await this.db.getMemodAnkiPackage(name);
        if (!cards) {
            const p = await this.loadAnkiPackageFromFile();
            cards = p.allCards.map(c => c.iCard);
            await this.persistCards(cards, 100);
        }
        return cards;
    }

    sendMessage(m: string) {
        this.messages$.next(new DebugMessage('anki-package-loader', m));
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
                resolve(await AnkiPackage.init(db, v, mediafile, s => this.sendMessage(s), this.name));
            });
        })
    }
}

const loaders: AnkiPackageLoader[] = [];
// Respond to message from parent thread
ctx.onmessage = async (ev) => {
    let next = (s: string) =>
        ctx.postMessage(`
                this.receiveDebugMessage(${JSON.stringify(new DebugMessage('worker-database', s))});
            `);
    const db = new MyAppDatabase(next);
    let {name, path}: { name: string, path: string } = JSON.parse(ev.data);
    try {
        const l = new AnkiPackageLoader(name, path, db);
    } catch (e) {
        console.error(e);
    }
};

