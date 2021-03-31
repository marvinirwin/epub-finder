import { IndexedRowsRepository } from './indexed-rows.repository'
import { DatabaseService } from '../Storage/database.service'
import { SuperMemoGrade } from 'supermemo'

export interface TranslationAttemptRecord {
    id?: number
    learningLanguage: string
    translationAttempt: string
    timestamp: Date
    nextDueDate: Date

    interval: number
    repetition: number
    efactor: number
    grade: SuperMemoGrade
}

export class TranslationAttemptRepository extends IndexedRowsRepository<TranslationAttemptRecord> {
    constructor({ db }: { db: DatabaseService }) {
        super({
            db,
            load: () => db.getWordRecordsGenerator(db.translationAttempts),
            add: (r) => db.translationAttempts.add(r),
            getIndexValue: (r) => ({ indexValue: r.learningLanguage }),
        })
    }
}
