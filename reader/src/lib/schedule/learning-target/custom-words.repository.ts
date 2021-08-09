import { CustomWord, DatabaseService} from '../../Storage/database.service'
import { IndexedRowsRepository } from '../indexed-rows.repository'
import {putPersistableEntity} from "../../Storage/putPersistableEntity";

export class CustomWordsRepository extends IndexedRowsRepository<CustomWord> {
    constructor({ databaseService }: { databaseService: DatabaseService }) {
        super({
            databaseService,
            load: () =>
                DatabaseService.queryPaginatedPersistableEntities('customWords', (v) => {
                    return v
                }),
            add: (r) => putPersistableEntity({entity: 'customWords', record: r}),
            getIndexValue: (r) => ({ indexValue: r.word }),
        })
    }
}