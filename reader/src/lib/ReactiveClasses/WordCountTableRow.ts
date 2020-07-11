import {BehaviorSubject, ReplaySubject} from "rxjs";
import {scan} from "rxjs/operators";
import {IWordCountRow} from "../Interfaces/IWordCountRow";
import {IWordRecognitionRow} from "../Scheduling/IWordRecognitionRow";

export class WordCountTableRow {
    addCountRecords$: ReplaySubject<IWordCountRow[]> = new ReplaySubject<IWordCountRow[]>(1)
    addNewRecognitionRecords$: ReplaySubject<IWordRecognitionRow[]> = new ReplaySubject<IWordRecognitionRow[]>(1)
    currentCount$: BehaviorSubject<number> = new BehaviorSubject<number>(1)
    currentRecognitionScore$: BehaviorSubject<number> = new BehaviorSubject<number>(1)
    lastWordRecognitionRecord$: ReplaySubject<IWordRecognitionRow | undefined> = new ReplaySubject<IWordRecognitionRow | undefined>(1);
    wordRecognitionRecords: IWordRecognitionRow[] = [];

    constructor(public word: string) {
        this.lastWordRecognitionRecord$.next(undefined);
        this.addCountRecords$.pipe(scan((acc, newRecords) => {
            return newRecords.reduce((sum, r) => sum + r.count, 0) + acc;
        }, 0)).subscribe(this.currentCount$);
        this.addNewRecognitionRecords$.pipe(scan((acc, newRecords) => {
            this.wordRecognitionRecords.push(...newRecords);
            if (newRecords.length) {
                this.lastWordRecognitionRecord$.next(newRecords[newRecords.length - 1])
            }
            return newRecords.reduce((sum, r) => sum + r.recognitionScore, 0) + acc;
        }, 0)).subscribe(this.currentRecognitionScore$);
    }
}