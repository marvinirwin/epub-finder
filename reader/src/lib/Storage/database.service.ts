import Dexie from 'dexie'
import { ICard } from '../../../../server/src/shared/ICard'
import { Setting } from '../../../../server/src/shared/Setting'
import { CreatedSentence } from '../../../../server/src/shared/CreatedSentence'
import { PronunciationProgressRow } from '../schedule/pronunciation-progress-row.interface'
import { WordRecognitionRow } from '../schedule/word-recognition-row'
import { BasicDocument } from '../../types'
import { IgnoredWord } from '../schedule/ignored-word.interface'
import { TranslationAttemptRecord } from '../schedule/translation-attempt.repository'

type PersistableEntity = 'userSettings' |
    'userSettingView' |
    'cards' |
    'spacedRepitionEntities' |
    'ignoredWords' |
    'customWords';

const queryPersistableEntity = <T>(
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
    const url = new URL(`${process.env.PUBLIC_URL}/entities/${entity}`)
    url.search = new URLSearchParams({
            where: JSON.stringify(where),
            skip: `${skip}`,
            take: `${take}`,
        },
    ).toString()

    return fetch(url.toString())
        .then(response => response.json())
}

export interface CustomWord {
    word: string;
    timestamp: Date;
    id: number;
    languageCode: string;
}

export class DatabaseService extends Dexie {
    static CURRENT_VERSION = 10

    public cards: Dexie.Table<ICard, number>
    public wordRecognitionRecords: Dexie.Table<WordRecognitionRow, number>
    public translationAttempts: Dexie.Table<TranslationAttemptRecord, number>
    public pronunciationRecords: Dexie.Table<PronunciationProgressRow, number>
    public ignoredWords: Dexie.Table<IgnoredWord, number>

    public createdSentences: Dexie.Table<CreatedSentence, number>
    public settings: Dexie.Table<Setting, string>
    public customDocuments: Dexie.Table<BasicDocument, string>
    public customWords: Dexie.Table<CustomWord, number>

    constructor() {
        super('DatabaseService')
        this.version(DatabaseService.CURRENT_VERSION).stores({
            cards: 'id++, learningLanguage, knownLanguage, deck',
            wordRecognitionRecords: 'id++, word, timestamp',
            translationAttempts:
                'id++, knownLanguage, learningLanguage, timestamp',
            pronunciationRecords: 'id++, word, timestamp',
            ignoredWords: 'id++, word, timestamp',
            settings2: 'name, value',
            createdSentences: 'id++, learningLanguage',
            customDocuments: 'name, html',
            customWords: 'id++, word, timestamp',
        })
        // The following lines are needed for it to work across typescipt using babel-preset-typescript:
        this.cards = this.table('cards')
        this.settings = this.table('settings2')
        this.wordRecognitionRecords = this.table('wordRecognitionRecords')
        this.pronunciationRecords = this.table('pronunciationRecords')
        this.ignoredWords = this.table('ignoredWords')
        this.createdSentences = this.table('createdSentences')
        this.customDocuments = this.table('customDocuments')
        this.translationAttempts = this.table('translationAttempts')
        this.customWords = this.table('customWords')
    }

    async getCardsInDatabaseCount(): Promise<number> {
        return this.cards.offset(0).count()
    }

    async* getCardsFromDB(
        whereStmts: { [key: string]: any },
        chunkSize: number = 500,
    ): AsyncGenerator<ICard[]> {
        let offset = 0
        const f = Object.values(whereStmts).length
            ? () => this.cards.where(whereStmts).offset(offset)
            : () =>
                this.cards
                    .where('learningLanguage')
                    .notEqual('')
                    .offset(offset)
        while (await f().first()) {
            const chunkedCards = await f().limit(chunkSize).toArray()
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
        let chunkedRecognitionRows: T[] = [];
        while (chunkedRecognitionRows = await queryPersistableEntity<T>({
            entity,
            skip,
            take: chunkSize
        })) {
            // HACK
            if (!chunkedRecognitionRows.length) {
                break;
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
