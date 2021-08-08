import Dexie, {Table} from 'dexie'
import {ICard} from '../../../../server/src/shared/ICard'
import {CreatedSentence} from '../../../../server/src/shared/CreatedSentence'
import {PronunciationProgressRow} from '../schedule/pronunciation-progress-row.interface'
import {WordRecognitionRow} from "../schedule/word-recognition-row";
import {queryPersistableEntity} from "./queryPersistableEntity";

export type PersistableEntity = 'userSettings' |
    'userSettingView' |
    'cards' |
    'spacedRepitionEntities' |
    'ignoredWords' |
    'customWords' |
    'knownWords';

export interface CustomWord {
    word: string;
    created_at: Date;
    id: number;
    creator_id: number | string;
    language_code: string;
}

export class DatabaseService extends Dexie {
    static CURRENT_VERSION = 11

    public pronunciationRecords: Dexie.Table<PronunciationProgressRow, number>

    public createdSentences: Dexie.Table<CreatedSentence, number>
    public spacedRepitionEntityCache: Table<any, WordRecognitionRow>;

    constructor() {
        super('DatabaseService')
        this.version(DatabaseService.CURRENT_VERSION).stores({
            translationAttempts:
                'id++, knownLanguage, learningLanguage, timestamp',
            pronunciationRecords: 'id++, word, timestamp',
            createdSentences: 'id++, learningLanguage',
            spacedRepetitionEntityCache: 'id, created_at'
        })
        this.pronunciationRecords = this.table('pronunciationRecords')
        this.createdSentences = this.table('createdSentences')
        this.spacedRepitionEntityCache = this.table('spacedRepetitionEntityCache');
    }

    async* getCardsFromDB(
        whereStmts: { [key: string]: any },
        chunkSize: number = 500,
    ): AsyncGenerator<ICard[]> {
        let offset = 0
        const f = () => queryPersistableEntity<ICard>({
            entity: 'cards',
            where: whereStmts,
            skip: offset,
            take: chunkSize,
        });
        while (true) {
            const records = await f()
            if (!records.length) {
                break
            }
            const chunkedCards = await f()
            yield chunkedCards
            offset += chunkSize
        }
    }

    async* getSentenceRowsFromDB(): AsyncGenerator<CreatedSentence[]> {
        let offset = 0
        const chunkSize = 500
        while (await this.createdSentences.offset(offset).first()) {
            const chunkedCreatedSentences = await this.createdSentences
                .offset(offset)
                .limit(chunkSize)
                .toArray()
            yield chunkedCreatedSentences
            offset += chunkSize
        }
    }

    async* getWordRecordsGenerator<T extends {created_at: Date}>(
        entity: PersistableEntity,
        mapFn?: (v: T) => T,
    ): AsyncGenerator<T[]> {
        let skip = 0
        const chunkSize = 500
        let chunkedRecognitionRows: T[] = []
        while (chunkedRecognitionRows = await queryPersistableEntity<T>({
            entity,
            skip,
            take: chunkSize,
        })) {
            // HACK
            if (!chunkedRecognitionRows.length) {
                break
            }
            if (mapFn) {
                yield chunkedRecognitionRows.map(mapFn)
            } else {
                yield chunkedRecognitionRows
            }
            skip += chunkSize
        }
    }
}
