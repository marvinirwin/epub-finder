import {IndexedRowsRepository} from './indexed-rows.repository'
import {DatabaseService} from '../Storage/database.service'
import {KnownWord} from '@shared/'
import {putPersistableEntity} from "../Storage/put-persistable-entity";
import {LoggedInUserService} from "../auth/logged-in-user.service";
import {LoadingService} from "../loading/loadingService";
import {observableLastValue} from "../../services/observableLastValue";

export class KnownWordsRepository extends IndexedRowsRepository<KnownWord> {
    constructor(
        {
            databaseService,
            loggedInUserService,
            loadingService
        }: {
            databaseService: DatabaseService,
            loadingService: LoadingService, loggedInUserService: LoggedInUserService
        }) {
        super({
            loggedInUserService,
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
            loadingService: loadingService
        })
    }
}
