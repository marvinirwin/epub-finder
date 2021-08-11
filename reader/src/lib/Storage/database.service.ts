import Dexie, {Table} from 'dexie'
import {ICard} from '../../../../server/src/shared/ICard'
import {CreatedSentence} from '../../../../server/src/shared/CreatedSentence'
import {PronunciationProgressRow} from '../schedule/pronunciation-progress-row.interface'
import {WordRecognitionRow} from "../schedule/word-recognition-row";
import {queryPersistableEntity} from "./queryPersistableEntity";
import {IgnoredWordView} from "../../../../server/src/entities/ignored-word-view.entity";
import {KnownWordView} from "../../../../server/src/entities/known-word-view.entity";

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

export type CachedEntity = {creator_email: string}

export class DatabaseService extends Dexie {
    static CURRENT_VERSION = 13

    public pronunciationRecords: Dexie.Table<PronunciationProgressRow, number>

    public createdSentences: Dexie.Table<CreatedSentence, number>

    public spacedRepitionEntityCache: Table<any, WordRecognitionRow & CachedEntity>;
    public ignoredWordsEntityCache: Table<any, IgnoredWordView & CachedEntity>;
    public knownWordsEntityCache: Table<any, KnownWordView & CachedEntity>;
    public customWordsEntityCache: Table<any, CustomWord & CachedEntity>;

    constructor() {
        super('DatabaseService')
        this.version(DatabaseService.CURRENT_VERSION).stores({
            translationAttempts:
                'id++, knownLanguage, learningLanguage, timestamp',
            pronunciationRecords: 'id++, word, timestamp',
            createdSentences: 'id++, learningLanguage',
            spacedRepetitionEntityCache: 'id, created_at',
            ignoredWordsEntityCache: 'id, created_at',
            knownWordsEntityCache: 'id, created_at',
            customWordsEntityCache: 'id, created_at',
        })
        this.pronunciationRecords = this.table('pronunciationRecords')
        this.createdSentences = this.table('createdSentences')
        this.spacedRepitionEntityCache = this.table('spacedRepetitionEntityCache');
        this.ignoredWordsEntityCache = this.table('ignoredWordsEntityCache');
        this.knownWordsEntityCache = this.table('knownWordsEntityCache');
        this.customWordsEntityCache = this.table('customWordsEntityCache');
    }

    static async* queryPaginatedPersistableEntities<T extends { created_at: Date}>(
        entity: PersistableEntity,
        mapFn: (v: T) => T,
        cache: Dexie.Table<T & CachedEntity>,
        currentUserEmail: string | undefined
    ): AsyncGenerator<T[]> {
        const chunkSize = 500
        const randomEntity = await cache.offset(0).first();
        const shouldClearCache = currentUserEmail && randomEntity?.creator_email !== currentUserEmail;
        const cachedEntitiesFound = !!randomEntity;
        let skip = 0;
        let startDate;
        let chunkedRecognitionRows: T[] = [];
        debugger;
        if (shouldClearCache) {
            // Delete everything from cache and fetch all
            await cache.clear();
        } else if (cachedEntitiesFound) {
            const allCachedEntities = await cache.orderBy('created_at').toArray();
            const latestEntity = allCachedEntities[allCachedEntities.length - 1];
            if (!latestEntity) {
                throw new Error(`LatestEntity is undefined after checking for randomEntity, this should never happen`);
            }
            startDate = latestEntity.created_at;
            yield allCachedEntities;
        }
        // tslint:disable-next-line:no-conditional-assignment
        while (chunkedRecognitionRows = await queryPersistableEntity<T>(this.getEntityWhereSkipTake({ entity, skip, chunkSize, startDate }))) {
            // Store these in the cache
            if (currentUserEmail) {
                await cache.bulkAdd(chunkedRecognitionRows.map(v => ({...v, creator_email: currentUserEmail})))
            }
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

    private static getEntityWhereSkipTake(
        {
            entity, skip, chunkSize, startDate
        }: {
            entity: PersistableEntity,
            skip: number,
            chunkSize: number,
            startDate: Date | undefined
        }) {
        const params = {
            entity,
            skip,
            take: chunkSize,
        } as any;
        if (startDate) {
            params.where = {
                created_at: {
                    gte: startDate
                }
            }
        }
        return params;
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
}
