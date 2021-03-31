import { IndexedRowsRepository } from './indexed-rows.repository'
import { PronunciationProgressRow } from './pronunciation-progress-row.interface'
import { DatabaseService } from '../Storage/database.service'

export class PronunciationProgressRepository extends IndexedRowsRepository<PronunciationProgressRow> {
    constructor({ databaseService }: { databaseService: DatabaseService }) {
        super({
            databaseService,
            load: () =>
                databaseService.getWordRecordsGenerator(databaseService.pronunciationRecords, (v) => {
                    if (!v.timestamp) {
                        v.timestamp = new Date()
                    }
                    return v
                }),
            add: (r) => databaseService.pronunciationRecords.add(r),
            getIndexValue: (r) => ({ indexValue: r.word }),
        })
    }
}
