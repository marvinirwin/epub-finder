import Dexie from "dexie";
import {BehaviorSubject, Observable, ReplaySubject, Subject} from "rxjs";
import {ICard} from "../Interfaces/ICard";
import {WordRecognitionRow} from "../Scheduling/WordRecognitionRow";
import {Setting} from "../Interfaces/Setting";
import {CreatedSentence} from "../Interfaces/CreatedSentence";
import {CustomDocument} from "../Website/Website";
import {ds_Dict} from "../Tree/DeltaScanner";
import {HotKeyEvents, Hotkeys} from "../HotKeyEvents";
import {map, shareReplay} from "rxjs/operators";


export class DatabaseService extends Dexie {
    static CURRENT_VERSION = 6;


    public cards: Dexie.Table<ICard, number>;
    public recognitionRecords: Dexie.Table<WordRecognitionRow, number>;
    public createdSentences: Dexie.Table<CreatedSentence, number>;
    public settings: Dexie.Table<Setting, string>;
    public customDocuments: Dexie.Table<CustomDocument, string>;

    constructor() {
        super("DatabaseService");
        this.version(DatabaseService.CURRENT_VERSION).stores({
            cards: 'id++, learningLanguage, knownLanguage, deck',
            recognitionRecords: 'id++, word, timestamp',
            settings2: 'name, value',
            createdSentences: 'id++, learningLanguage',
            customDocuments: 'name, html'
        });
        // The following lines are needed for it to work across typescipt using babel-preset-typescript:
        this.cards = this.table("cards");
        this.settings = this.table("settings2");
        this.recognitionRecords = this.table("recognitionRecords");
        this.createdSentences = this.table("createdSentences");
        this.customDocuments = this.table("customDocuments");


    }

    async getCardsInDatabaseCount(): Promise<number> {
        return this.cards.offset(0).count();
    }

    async* getCardsFromDB(
        whereStmts: { [key: string]: any },
        chunkSize: number = 500
    ): AsyncGenerator<ICard[]> {
        let offset = 0;
        const f = Object.values(whereStmts).length ?
            () => this.cards.where(whereStmts).offset(offset) :
            () => this.cards.where('learningLanguage').notEqual('').offset(offset)
        while (await f().first()) {
            const chunkedCards = await f().limit(chunkSize).toArray();
            yield chunkedCards;
            offset += chunkSize;
        }
    }

    async* getSentenceRowsFromDB(): AsyncGenerator<CreatedSentence[]> {
        let offset = 0;
        const chunkSize = 500;
        while (await this.createdSentences.offset(offset).first()) {
            const chunkedCreatedSentences = await this.createdSentences.offset(offset).limit(chunkSize).toArray();
            yield chunkedCreatedSentences;
            offset += chunkSize;
        }
    }

    async* getRecognitionRowsFromDB(): AsyncGenerator<WordRecognitionRow[]> {
        let offset = 0;
        const chunkSize = 500;
        while (await this.recognitionRecords.offset(offset).first()) {
            const chunkedRecognitionRows = await this.recognitionRecords.offset(offset).limit(chunkSize).toArray();
            chunkedRecognitionRows.forEach(r => r.word = r.word.normalize())
            yield chunkedRecognitionRows;
            offset += chunkSize;
        }
    }

}