import { CustomWord, DatabaseService } from '../../Storage/database.service'
import { IndexedRowsRepository } from '../indexed-rows.repository'

export class CustomWordsRepository extends IndexedRowsRepository<CustomWord> {
    constructor({ databaseService }: { databaseService: DatabaseService }) {
        super({
            databaseService,
            load: () =>
                databaseService.getWordRecordsGenerator(databaseService.customWords, (v) => {
                    if (!v.timestamp) {
                        v.timestamp = new Date()
                    }
                    return v
                }),
            add: (r) => databaseService.customWords.add(r),
            getIndexValue: (r) => ({ indexValue: r.word }),
        })
    }
}