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
    constructor({ databaseService }: { databaseService: DatabaseService }) {
        super({
            databaseService,
            load: () => databaseService.getWordRecordsGenerator(databaseService.translationAttempts),
            add: (r) => databaseService.translationAttempts.add(r),
            getIndexValue: (r) => ({ indexValue: r.learningLanguage }),
        })
    }
}
