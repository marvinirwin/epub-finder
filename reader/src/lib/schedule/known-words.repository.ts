import {IndexedRowsRepository} from './indexed-rows.repository'
import {DatabaseService} from '../Storage/database.service'
import {KnownWord} from '../../../../server/src/entities/known-word.entity'
import {putPersistableEntity} from "../Storage/putPersistableEntity";
import {observableLastValue} from "../../services/settings.service";
import {LoggedInUserService} from "../auth/logged-in-user.service";

export class KnownWordsRepository extends IndexedRowsRepository<KnownWord> {
    constructor({ databaseService, loggedInUserService }: { databaseService: DatabaseService, loggedInUserService: LoggedInUserService }) {
        super({
            databaseService,
            load: async () => {
                const email = (await observableLastValue(loggedInUserService.profile$))?.email;
                return DatabaseService.queryPaginatedPersistableEntities<KnownWord>(
                    'knownWords',
                    (knownWordRecord) => {
                        // TODO, maybe put a timestamp parser here?
                        return knownWordRecord;
                    },
                    databaseService.knownWordsEntityCache,
                    email
                );
            },
            add: (r) => putPersistableEntity({entity: 'knownWords', record: r}),
            getIndexValue: (r) => ({ indexValue: r.word }),
        })
    }
}
