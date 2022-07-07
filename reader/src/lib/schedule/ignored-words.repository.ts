import {IndexedRowsRepository} from './indexed-rows.repository'
import {DatabaseService, CachedEntity} from '../Storage/database.service'
import {IgnoredWord} from 'languagetrainer-server/src/shared'
import {putPersistableEntity} from "../Storage/put-persistable-entity";
import {observableLastValue} from "../../services/settings.service";
import {LoggedInUserService} from "../auth/logged-in-user.service";

export class IgnoredWordsRepository extends IndexedRowsRepository<IgnoredWord> {
    constructor({ databaseService, loggedInUserService }: { databaseService: DatabaseService, loggedInUserService: LoggedInUserService }) {
        super({
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
            getIndexValue: (r) => ({ indexValue: r.word }),
        })
    }
}
