import {IndexedRowsRepository} from './indexed-rows.repository'
import {WordRecognitionRow} from './word-recognition-row'
import {DatabaseService} from '../Storage/database.service'
import {putPersistableEntity} from "../Storage/put-persistable-entity";
import {LoggedInUserService} from "../auth/logged-in-user.service";
import {observableLastValue} from "../../services/settings.service";
import {LoadingWrapperService} from "../loading/loadingService";

export class WordRecognitionProgressRepository extends IndexedRowsRepository<WordRecognitionRow> {
    constructor(
        {
            databaseService,
            loggedInUserService,
            loadingWrapperService
        }: {
            databaseService: DatabaseService,
            loggedInUserService: LoggedInUserService,
            loadingWrapperService: LoadingWrapperService,
        }) {
        super({
            databaseService,
            load: async () => {
                const profile = await observableLastValue(loggedInUserService.profile$)
                return DatabaseService.queryPaginatedPersistableEntities(
                    'spacedRepitionEntities',
                    v => v,
                    databaseService.spacedRepitionEntityCache,
                    profile?.email
                );
            },
            add: (r) => putPersistableEntity({entity: 'spacedRepitionEntities', record: r}),
            getIndexValue: (r) => ({indexValue: r.word}),
            loadingWrapperService,
            loggedInUserService
        })
    }
}
