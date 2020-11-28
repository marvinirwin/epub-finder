import {ProgressRowService} from "./progress-row.service";
import {WordRecognitionRow} from "./word-recognition-row";
import {DatabaseService} from "../Storage/database.service";

export class RecognitionProgressService extends ProgressRowService<WordRecognitionRow> {
    constructor({db}: { db: DatabaseService }) {
        super({
            db,
            load: () => db.getWordRecordsGenerator(db.wordRecognitionRecords),
            add: (r) => db.wordRecognitionRecords.add(r)
        });
    }
}