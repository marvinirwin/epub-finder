import {BehaviorSubject, ReplaySubject} from "rxjs";
import {scan} from "rxjs/operators";
import {iWordCountRow, IWordRecognitionRow} from "./Manager";

export class WordCountTableRow {
    addCountRecords$: ReplaySubject<iWordCountRow[]> = new ReplaySubject<iWordCountRow[]>(1)
    addNewRecognitionRecords$: ReplaySubject<IWordRecognitionRow[]> = new ReplaySubject<IWordRecognitionRow[]>(1)
    currentCount$: BehaviorSubject<number> = new BehaviorSubject<number>(1)
    currentRecognitionScore$: BehaviorSubject<number> = new BehaviorSubject<number>(1)

    constructor(public word: string) {
        this.addCountRecords$.pipe(scan((acc, newRecords) => {
            return newRecords.reduce((sum, r) => sum + r.count, 0) + acc;
        }, 0)).subscribe(this.currentCount$);
        this.addNewRecognitionRecords$.pipe(scan((acc, newRecords) => {
            return newRecords.reduce((sum, r) => sum + r.recognitionScore, 0) + acc;
        }, 0)).subscribe(this.currentRecognitionScore$);
    }
}