import { IndexedRowsRepository } from './indexed-rows.repository'
import { WordRecognitionRow } from './word-recognition-row'
import { DatabaseService } from '../Storage/database.service'

export class WordRecognitionProgressRepository extends IndexedRowsRepository<WordRecognitionRow> {
    constructor({ databaseService }: { databaseService: DatabaseService }) {
        super({
            databaseService,
            load: () => databaseService.getWordRecordsGenerator(databaseService.wordRecognitionRecords),
            add: (r) => databaseService.wordRecognitionRecords.add(r),
            getIndexValue: (r) => ({ indexValue: r.word }),
        })
    }
}
