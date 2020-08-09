import Dexie from "dexie";
import {ReplaySubject} from "rxjs";
import {ICard} from "../Interfaces/ICard";
import {WordRecognitionRow} from "../Scheduling/WordRecognitionRow";
import {ISetting} from "../Interfaces/ISetting";
import {CreatedSentence} from "../Interfaces/CreatedSentence";


export class MyAppDatabase extends Dexie {
    static CURRENT_VERSION = 5;

    cards: Dexie.Table<ICard, number>;
    recognitionRecords: Dexie.Table<WordRecognitionRow, number>;
    createdSentences: Dexie.Table<CreatedSentence, number>;
    settings: Dexie.Table<ISetting, string>;

    messages$: ReplaySubject<string> = new ReplaySubject<string>();

    constructor() {
        super("MyAppDatabase");
        this.messages$.next("Starting database, creating stories")
        this.version(MyAppDatabase.CURRENT_VERSION).stores({
            cards: 'id++, learningLanguage, knownLanguage, deck',
            recognitionRecords: 'id++, word, timestamp',
            settings: 'key, value',
            createdSentences: 'id++, learningLanguage'
        });
        this.messages$.next("Stores created, initializing AnkiPackageSQLiteTables")
        // The following lines are needed for it to work across typescipt using babel-preset-typescript:
        this.cards = this.table("cards");
        this.settings = this.table("settings");
        this.recognitionRecords = this.table("recognitionRecords");
        this.createdSentences = this.table("createdSentences");
        this.messages$.next("Tables initialized")
    }

    async getCardsInDatabaseCount(): Promise<number> {
        return this.cards.offset(0).count();
    }

    async* getCardsFromDB(
        whereStmts: {[key: string]: any},
        chunkSize: number = 500
    ): AsyncGenerator<ICard[]> {
        let offset = 0;
        const f = Object.values(whereStmts).length ?
            () => this.cards.where(whereStmts).offset(offset) :
            () => this.cards.where('learningLanguage').notEqual('').offset(offset)
        while (await f().first()) {
            this.messages$.next(`Querying cards in chunks ${offset}`)
            const chunkedCards = await f().limit(chunkSize).toArray();
            yield chunkedCards;
            offset += chunkSize;
        }
    }

    async* getSentenceRowsFromDB(): AsyncGenerator<CreatedSentence[]>{
        let offset = 0;
        let chunkSize = 500;
        while (await this.createdSentences.offset(offset).first()) {
            this.messages$.next(`Querying cards in chunks ${offset}`)
            const chunkedCreatedSentences = await this.createdSentences.offset(offset).limit(chunkSize).toArray();
            yield chunkedCreatedSentences;
            offset += chunkSize;
        }
    }

    async* getRecognitionRowsFromDB(): AsyncGenerator<WordRecognitionRow[]> {
        let offset = 0;
        let chunkSize = 500;
        while (await this.recognitionRecords.offset(offset).first()) {
            this.messages$.next(`Querying cards in chunks ${offset}`)
            const chunkedRecognitionRows = await this.recognitionRecords.offset(offset).limit(chunkSize).toArray();
            yield chunkedRecognitionRows;
            offset += chunkSize;
        }
    }
}