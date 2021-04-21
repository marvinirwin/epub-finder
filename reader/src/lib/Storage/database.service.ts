import Dexie from 'dexie'
import { ICard } from '../../../../server/src/shared/ICard'
import { CreatedSentence } from '../../../../server/src/shared/CreatedSentence'
import { PronunciationProgressRow } from '../schedule/pronunciation-progress-row.interface'

export type PersistableEntity = 'userSettings' |
    'userSettingView' |
    'cards' |
    'spacedRepitionEntities' |
    'ignoredWords' |
    'customWords';

export const queryPersistableEntity = <T>(
    {
        entity,
        where,
        skip,
        take,
    }:
        {
            entity: PersistableEntity,
            where?: Partial<T>,
            skip?: number,
            take?: number
        },
): Promise<T[]> => {
    const url1 = `${process.env.PUBLIC_URL}/entities/${entity}`
    debugger;
    const url = new URL(url1)
    url.search = new URLSearchParams({
            where: JSON.stringify(where),
            skip: `${skip}`,
            take: `${take}`,
        },
    ).toString()

    return fetch(url.toString())
        .then(response => response.json())
}

export const putPersistableEntity = <T>(
    {
        entity,
        record,
    }: {
        entity: PersistableEntity,
        record: Partial<T>
    },
) => {
    const url = new URL(`${process.env.PUBLIC_URL}/entities/${entity}`)
    return fetch(
        url.toString(),
        {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(record),
        },
    ).then(response => response.json())
}

export interface CustomWord {
    word: string;
    timestamp: Date;
    id: number;
    languageCode: string;
}

export class DatabaseService extends Dexie {
    static CURRENT_VERSION = 10

    public pronunciationRecords: Dexie.Table<PronunciationProgressRow, number>

    public createdSentences: Dexie.Table<CreatedSentence, number>

    constructor() {
        super('DatabaseService')
        this.version(DatabaseService.CURRENT_VERSION).stores({
            translationAttempts:
                'id++, knownLanguage, learningLanguage, timestamp',
            pronunciationRecords: 'id++, word, timestamp',
            createdSentences: 'id++, learningLanguage',
        })
        this.pronunciationRecords = this.table('pronunciationRecords')
        this.createdSentences = this.table('createdSentences')
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

    async* getWordRecordsGenerator<T>(
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
