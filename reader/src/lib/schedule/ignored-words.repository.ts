import {IndexedRowsRepository} from './indexed-rows.repository'
import {DatabaseService, CachedEntity} from '../Storage/database.service'
import {IgnoredWord} from '@shared/'
import {putPersistableEntity} from "../Storage/put-persistable-entity";
import {LoggedInUserService} from "../auth/logged-in-user.service";
import {LoadingService} from "../loading/loadingService";
import {observableLastValue} from "../../services/observableLastValue";

// @ts-ignore
export class IgnoredWordsRepository extends IndexedRowsRepository<IgnoredWord> {
    constructor(
        {
            databaseService,
            loggedInUserService,
            loadingService
        }: {
            databaseService: DatabaseService,
            loggedInUserService: LoggedInUserService,
            loadingService: LoadingService,
        }) {
        super({
            loadingService: loadingService,
            databaseService,
            load: async () => {
                const profile = await observableLastValue(loggedInUserService.profile$);
                return DatabaseService.queryPaginatedPersistableEntities<IgnoredWord & CachedEntity>(
                    'ignoredWords',
                    (ignoredWordRecord) => {
                        // TODO, maybe put a timestamp parser here?
                        return ignoredWordRecord;
                    },
                    databaseService.ignoredWordsEntityCache,
                    profile?.email
                );
            },
            add: (r) => putPersistableEntity({entity: 'ignoredWords', record: r}),
            getIndexValue: (r) => ({indexValue: r.word}),
            loggedInUserService
        })
    }
}
