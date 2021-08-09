import { IndexedRowsRepository } from './indexed-rows.repository'
import { DatabaseService} from '../Storage/database.service'
import { KnownWord } from '../../../../server/src/entities/known-word.entity'
import {putPersistableEntity} from "../Storage/putPersistableEntity";

export class KnownWordsRepository extends IndexedRowsRepository<KnownWord> {
    constructor({ databaseService }: { databaseService: DatabaseService }) {
        super({
            databaseService,
            load: () =>
                DatabaseService.queryPaginatedPersistableEntities('knownWords', (ignoredWordRecord) => {
                    // TODO, maybe put a timestamp parser here?
                    return ignoredWordRecord;
                }),
            add: (r) => putPersistableEntity({entity: 'knownWords', record: r}),
            getIndexValue: (r) => ({ indexValue: r.word }),
        })
    }
}
