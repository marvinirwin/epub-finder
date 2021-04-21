import { IndexedRowsRepository } from './indexed-rows.repository'
import { PronunciationProgressRow } from './pronunciation-progress-row.interface'
import { DatabaseService, putPersistableEntity } from '../Storage/database.service'
import { IgnoredWord } from './ignored-word.interface'

export class IgnoredWordsRepository extends IndexedRowsRepository<IgnoredWord> {
    constructor({ databaseService }: { databaseService: DatabaseService }) {
        super({
            databaseService,
            load: () =>
                databaseService.getWordRecordsGenerator('ignoredWords', (v) => {
                    if (!v.timestamp) {
                        v.timestamp = new Date()
                    }
                    return v
                }),
            add: (r) => putPersistableEntity({entity: 'ignoredWords', record: r}),
            getIndexValue: (r) => ({ indexValue: r.word }),
        })
    }
}
