import {ProgressRowService} from "./progress-row.service";
import {PronunciationProgressRow} from "./pronunciation-progress-row.interface";
import {DatabaseService} from "../Storage/database.service";

export class PronunciationProgressService extends ProgressRowService<PronunciationProgressRow> {
    constructor({db}: { db: DatabaseService }) {
        super({
                db,
                load: () => db.getWordRecordsGenerator(db.pronunciationRecords),
                add: (r) => db.pronunciationRecords.add(r)
            }
        );
    }
}