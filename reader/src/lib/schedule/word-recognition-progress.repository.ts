import {IndexedRowsRepository} from "./indexed-rows.repository";
import {WordRecognitionRow} from "./word-recognition-row";
import {DatabaseService} from "../Storage/database.service";

export class WordRecognitionProgressRepository extends IndexedRowsRepository<WordRecognitionRow> {
    constructor({db}: { db: DatabaseService }) {
        super({
            db,
            load: () => db.getWordRecordsGenerator(db.wordRecognitionRecords),
            add: (r) => db.wordRecognitionRecords.add(r)
        });
    }
}