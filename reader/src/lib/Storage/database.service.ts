import Dexie from "dexie";
import {ICard} from "../../../../server/src/shared/ICard";
import {Setting} from "../../../../server/src/shared/Setting";
import {CreatedSentence} from "../../../../server/src/shared/CreatedSentence";
import {PronunciationProgressRow} from "../schedule/pronunciation-progress-row.interface";
import {WordRecognitionRow} from "../schedule/word-recognition-row";
import {BasicDocument} from "../../types";
import {IgnoredWord} from "../schedule/ignored-word.interface";


export class DatabaseService extends Dexie {
    static CURRENT_VERSION = 8;


    public cards: Dexie.Table<ICard, number>;
    public wordRecognitionRecords: Dexie.Table<WordRecognitionRow, number>;
    public pronunciationRecords: Dexie.Table<PronunciationProgressRow, number>
    public ignoredWords: Dexie.Table<IgnoredWord, number>

    public createdSentences: Dexie.Table<CreatedSentence, number>;
    public settings: Dexie.Table<Setting, string>;
    public customDocuments: Dexie.Table<BasicDocument, string>;

    constructor() {
        super("DatabaseService");
        this.version(DatabaseService.CURRENT_VERSION).stores({
            cards: 'id++, learningLanguage, knownLanguage, deck',
            wordRecognitionRecords: 'id++, word, timestamp',
            pronunciationRecords: 'id++, word, timestamp',
            ignoredWords: 'id++, word, timestamp',
            settings2: 'name, value',
            createdSentences: 'id++, learningLanguage',
            customDocuments: 'name, html',
        });
        // The following lines are needed for it to work across typescipt using babel-preset-typescript:
        this.cards = this.table("cards");
        this.settings = this.table("settings2");
        this.wordRecognitionRecords = this.table("wordRecognitionRecords");
        this.pronunciationRecords = this.table("pronunciationRecords");
        this.ignoredWords = this.table("ignoredWords");
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

    async* getWordRecordsGenerator<T extends {word: string}>(table: Dexie.Table<T>, mapFn?: (v:T)=> T): AsyncGenerator<T[]> {
        let offset = 0;
        const chunkSize = 500;
        while (await table.offset(offset).first()) {
            const chunkedRecognitionRows = await table.offset(offset).limit(chunkSize).toArray();
            chunkedRecognitionRows.forEach(r => r.word = r.word.normalize())
            if (mapFn) {
                yield chunkedRecognitionRows.map(mapFn);
            } else {
                yield chunkedRecognitionRows;
            }
            offset += chunkSize;
        }
    }
}