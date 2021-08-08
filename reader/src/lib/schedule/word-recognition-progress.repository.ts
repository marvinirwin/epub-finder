import { IndexedRowsRepository } from './indexed-rows.repository'
import { WordRecognitionRow } from './word-recognition-row'
import { DatabaseService} from '../Storage/database.service'
import {putPersistableEntity} from "../Storage/putPersistableEntity";

export class WordRecognitionProgressRepository extends IndexedRowsRepository<WordRecognitionRow> {
    constructor({ databaseService }: { databaseService: DatabaseService }) {
        super({
            databaseService,
            load: () => databaseService.getWordRecordsGenerator('spacedRepitionEntities'),
            add: (r) => putPersistableEntity({entity: 'spacedRepitionEntities', record: r}),
            getIndexValue: (r) => ({ indexValue: r.word }),
        })
    }
}
