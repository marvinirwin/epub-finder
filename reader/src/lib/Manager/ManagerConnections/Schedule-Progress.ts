import {HSKLevel, HSKWord, ProgressManager} from "../ProgressManager";
import {ScheduleManager} from "../ScheduleManager";
import HSK1 from '../../HSK/hsk-level-1.json';
import {map} from "rxjs/operators";
import {ScheduleRow} from "../../ReactiveClasses/ScheduleRow";
import {Dictionary} from "lodash";

export function ScheduleProgress(s: ScheduleManager, p: ProgressManager) {
    let hsk1 = HSK1 as Array<HSKWord>;
    p.hsk1 = new HSKLevel(
        hsk1.map(w => w.hanzi),
        s.wordScheduleRowDict$.pipe(
            map((scheduleRow: Dictionary<ScheduleRow>) =>
                Object.fromEntries(Object.entries(scheduleRow)
                    .map(([word, {wordRecognitionRecords}]) =>
                        ([word, wordRecognitionRecords[wordRecognitionRecords.length - 1]])
                    ))
            )
        )
    );
}