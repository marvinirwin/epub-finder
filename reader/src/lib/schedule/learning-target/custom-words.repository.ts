import {CustomWord, DatabaseService} from '../../Storage/database.service'
import {IndexedRowsRepository} from '../indexed-rows.repository'
import {putPersistableEntity} from "../../Storage/put-persistable-entity";
import {observableLastValue} from "../../../services/settings.service";
import {LoggedInUserService} from "../../auth/logged-in-user.service";
import {LoadingWrapperService} from "../../loading/loadingService";

export class CustomWordsRepository extends IndexedRowsRepository<CustomWord> {
    constructor(
        {
            loadingWrapperService,
            databaseService,
            loggedInUserService
        }: {
            databaseService: DatabaseService,
            loggedInUserService: LoggedInUserService,
            loadingWrapperService: LoadingWrapperService
        }) {
        super({
            databaseService,
            load: async () => {
                const email = (await observableLastValue(loggedInUserService.profile$))?.email;
                return DatabaseService.queryPaginatedPersistableEntities('customWords', (v) => {
                        return v
                    },
                    databaseService.customWordsEntityCache,
                    email);
            },
            add: (r) => putPersistableEntity({entity: 'customWords', record: r}),
            getIndexValue: (r) => ({indexValue: r.word}),
            loadingWrapperService,
        })
    }
}