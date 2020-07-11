import {ReplaySubject, Subject} from "rxjs";
import  MS from 'memory-scheduler';
import {IWordRecognitionRow} from "../Scheduling/IWordRecognitionRow";
import {MyAppDatabase} from "../Storage/AppDB";

const DAY_IN_MINISECONDS = 24 * 60 * 60 * 1000;


export const WordRecognitionLevels = {
    "Hard": -3,
    "Medium": -1,
    "Easy": 1
}

export const today = Math.round(new Date().getTime() / DAY_IN_MINISECONDS);
export const yesterday = today-1;
export const ms = new MS([1, 2, 3, 8, 17], Object.values(WordRecognitionLevels));


export interface ScheduleWordRecognitionRow extends IWordRecognitionRow {

}

export class WordRecognitionManager {
    addPersistedWordRecognitionRows$: ReplaySubject<IWordRecognitionRow[]> = new ReplaySubject<IWordRecognitionRow[]>();
    addUnpersistedWordRecognitionRows$: Subject<IWordRecognitionRow[]> = new Subject<IWordRecognitionRow[]>();

    constructor(public db: MyAppDatabase) {
        this.addUnpersistedWordRecognitionRows$.subscribe((async rows => {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                row.id = await this.db.recognitionRecords.add(row);
            }
            this.addPersistedWordRecognitionRows$.next(rows);
        }));
        this.loadRecognitionRows();
    }

    private async loadRecognitionRows() {
        const generator = this.db.getRecognitionRowsFromDB();
        for await (let rowChunk of generator) {
            this.addPersistedWordRecognitionRows$.next(rowChunk);
        }
    }
}