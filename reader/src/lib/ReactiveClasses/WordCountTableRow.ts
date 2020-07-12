import {BehaviorSubject, Observable, ReplaySubject} from "rxjs";
import {map, scan, shareReplay, startWith} from "rxjs/operators";
import {IWordCountRow} from "../Interfaces/IWordCountRow";
import {IWordRecognitionRow} from "../Scheduling/IWordRecognitionRow";
import assert from "assert";
import { sumBy } from "lodash";

export class WordCountTableRow {
    wordCountRecords: IWordCountRow[] = [];
    wordRecognitionRecords: IWordRecognitionRow[] = [];

    getCurrentCount(): number {
        return sumBy(this.wordCountRecords, wordCountRow => wordCountRow.count)
    }
    getCurrentDueDate(): Date {
        return this.wordRecognitionRecords[this.wordRecognitionRecords.length - 1]?.nextDueDate || new Date();
    }
    get orderValue() {
        let number = (new Date()).getTime() - this.getCurrentDueDate().getTime();
        return number + (number * this.getCurrentCount())
    }

    constructor(public word: string) {
    }
}