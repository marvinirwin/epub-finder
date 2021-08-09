import {IndexedRowsRepository} from './indexed-rows.repository'
import {DatabaseService} from '../Storage/database.service'
import {IgnoredWord} from '../../../../server/src/entities/ignored-word.entity'
import {putPersistableEntity} from "../Storage/putPersistableEntity";

export class IgnoredWordsRepository extends IndexedRowsRepository<IgnoredWord> {
    constructor({ databaseService }: { databaseService: DatabaseService }) {
        super({
            databaseService,
            load: () =>
                DatabaseService.queryPaginatedPersistableEntities(
                    'ignoredWords',
                    (ignoredWordRecord) => {
                        // TODO, maybe put a timestamp parser here?
                        return ignoredWordRecord;
                    },
                    databaseService.ignoredWordsEntityCache,

                ),
            add: (r) => putPersistableEntity({entity: 'ignoredWords', record: r}),
            getIndexValue: (r) => ({ indexValue: r.word }),
        })
    }
}
