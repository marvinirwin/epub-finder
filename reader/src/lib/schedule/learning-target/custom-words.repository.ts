import {CustomWord, DatabaseService} from '../../Storage/database.service'
import {IndexedRowsRepository} from '../indexed-rows.repository'
import {putPersistableEntity} from "../../Storage/put-persistable-entity";
import {LoggedInUserService} from "../../auth/logged-in-user.service";
import {LoadingWrapperService} from "../../loading/loadingService";
import {observableLastValue} from "../../../services/observableLastValue";

export class CustomWordsRepository extends IndexedRowsRepository<CustomWord> {
    constructor(
        {
            loadingWrapperService,
            databaseService,
            loggedInUserService
        }: {
            databaseService: DatabaseService,
            loadingWrapperService: LoadingWrapperService, loggedInUserService: LoggedInUserService
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
            loggedInUserService
        })
    }
}