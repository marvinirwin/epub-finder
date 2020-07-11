/* eslint no-restricted-globals: 0 */
// @ts-ignore Workers don't have the window object
import {AnkiPackage} from "../../Anki";
import {ReplaySubject, Subject} from "rxjs";
import initSqlJs from "sql.js";
// @ts-ignore
import JSZip from 'jszip';
// @ts-ignore
import {getBinaryContent} from 'jszip-utils';
import {SerializedAnkiPackage} from "../Interfaces/OldAnkiClasses/SerializedAnkiPackage";
import DebugMessage from "../../Debug-Message";
import {ICard} from "../Interfaces/ICard";
import {CardMessage, ThreadMessageKey} from "../Interfaces/Message";
import { chunk, invert } from "lodash";

// @ts-ignore
self["window"] = self;
const ctx: Worker = self as any;

class AnkiPackageLoader {
    messages$: ReplaySubject<DebugMessage> = new ReplaySubject<DebugMessage>();
    ankiPackageLoaded$: Subject<SerializedAnkiPackage> = new Subject<SerializedAnkiPackage>();

    sendCards(c: ICard[]) {
        this.sendMessage(`Sending ${c.length} cards`)
/*
        ctx.postMessage(
            `this.addCards$.next(${JSON.stringify(c)})`
        )
*/
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

    constructor(public name: string, public path: string) {
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

/*
    private async getCardGenerator(packageName: string): Promise<AsyncGenerator<ICard>> {
        if (await this.db.getCachedCardsExists()) {
            this.sendMessage(`Found cached cards for ${packageName}, not loading from AnkiPackage`)
            return this.db.getCardsFromDB(packageName)
        }
        this.sendMessage(`Cards not found in indexDB, loading from AnkiPackage`)
        return this.loadAnkiPackageFromFile();
    }
*/

    sendMessage(m: string) {
        this.messages$.next(new DebugMessage('anki-package-loader', m));
    }

    loadAnkiPackageFromFile(): Promise<AsyncGenerator<ICard>> {
        return new Promise(resolve => {
            this.sendMessage(`Loading ${this.name}`);
            getBinaryContent(this.path, async (err: boolean | Error, data: any) => {
                if (err) {
                    this.sendMessage(`Error loading anki package binary file ${err}`);
                    throw new Error("Error getting binary content");
                }
                this.sendMessage('Unzipping Anki Archive')
                const zipFile = await JSZip.loadAsync(data);
                this.sendMessage(`Loading SQLite file`)
                const ankiDatabaseBinary = await zipFile.files['collection.anki2'].async('uint8array');
                this.sendMessage(`Loading media file`)
                const mediafile: { [key: string]: string } = invert(JSON.parse(await zipFile.files['media'].async('text')));
                this.sendMessage(`Initializing SQLite database`)
                const SQL = await initSqlJs();
                var db = new SQL.Database(ankiDatabaseBinary);
                this.sendMessage(`Interpolating and indexing cards`)
                resolve(AnkiPackage.initCollections(db, zipFile, mediafile, (s: string) => this.sendMessage(s), this.name));
            });
        })
    }
}

const loaders: AnkiPackageLoader[] = [];

// Respond to message from parent thread
ctx.onmessage = async (ev) => {

    const packagePath = ev.data;

    let {name, path}: { name: string, path: string } = JSON.parse(ev.data);
    try {
        const cards: ICard[] = []
        let gen: AsyncGenerator<ICard> = await new AnkiPackageLoader(name, path).loadAnkiPackageFromFile()
        for await (let icard of gen) {
            cards.push(icard);
        }
        const m: CardMessage = {
            key: ThreadMessageKey.Cards,
            cards
        }
        ctx.postMessage({})
    } catch (e) {
        console.error(e);
    }
};

