import { IndexedRowsRepository } from './indexed-rows.repository'
import { PronunciationProgressRow } from './pronunciation-progress-row.interface'
import { DatabaseService } from '../Storage/database.service'


export async function* emptyGenerator<T>(
): AsyncGenerator<T[]> {
    yield [];
}

export class PronunciationProgressRepository extends IndexedRowsRepository<PronunciationProgressRow> {
    constructor({ databaseService }: { databaseService: DatabaseService }) {
        // @ts-ignore
        super({
            databaseService,
            load: emptyGenerator,
/*
                databaseService.getWordRecordsGenerator(pronunciationRecords, (v) => {
                    if (!v.timestamp) {
                        v.timestamp = new Date()
                    }
                    return v
                }),
*/
            // @ts-ignore I don't know why this broke all of a sudden
            add: (r) => databaseService.pronunciationRecords
                .add(r as PronunciationProgressRow).then(id => ({...r, id})),
            getIndexValue: (r) => ({ indexValue: r.word }),
        })
    }
}
