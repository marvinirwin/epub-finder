import {IndexedRowsRepository} from "./indexed-rows.repository";
import {PronunciationProgressRow} from "./pronunciation-progress-row.interface";
import {DatabaseService} from "../Storage/database.service";
import {IgnoredWord} from "./ignored-word.interface";

export class IgnoredWordsRepository extends IndexedRowsRepository<IgnoredWord> {
    constructor({db}: { db: DatabaseService }) {
        super({
                db,
                load: () => db.getWordRecordsGenerator(db.ignoredWords, v => {
                    if (!v.timestamp) {
                        v.timestamp = new Date()
                    }
                    return v
                }),
                add: (r) => db.ignoredWords.add(r)
            }
        );
    }
}