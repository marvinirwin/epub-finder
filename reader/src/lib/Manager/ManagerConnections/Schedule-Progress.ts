import {HSKLevel, HSKWord, ProgressManager} from "../ProgressManager";
import {ScheduleManager} from "../ScheduleManager";
import HSK1 from '../../HSK/hsk-level-1.json';
import {map} from "rxjs/operators";
import {Dictionary} from "lodash";
import {ScheduleRow} from "../../ReactiveClasses/schedule-row.interface";

export function ScheduleProgress(s: ScheduleManager, p: ProgressManager) {
/*
    let hsk1 = HSK1 as Array<HSKWord>;
    p.hsk1 = new HSKLevel(
        hsk1.map(w => w.hanzi),
        s.indexedScheduleRows$.pipe(
            map((scheduleRow: Dictionary<ScheduleRow>) =>
                Object.fromEntries(Object.entries(scheduleRow)
                    .map(([word, {wordRecognitionRecords}]) =>
                        ([word, wordRecognitionRecords[wordRecognitionRecords.length - 1]])
                    ))
            )
        )
    );
*/
}