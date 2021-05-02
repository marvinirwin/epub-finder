import { CustomWord, DatabaseService, putPersistableEntity } from '../../Storage/database.service'
import { IndexedRowsRepository } from '../indexed-rows.repository'

export class CustomWordsRepository extends IndexedRowsRepository<CustomWord> {
    constructor({ databaseService }: { databaseService: DatabaseService }) {
        super({
            databaseService,
            load: () =>
                databaseService.getWordRecordsGenerator('customWords', (v) => {
                    return v
                }),
            add: (r) => putPersistableEntity({entity: 'customWords', record: r}),
            getIndexValue: (r) => ({ indexValue: r.word }),
        })
    }
}