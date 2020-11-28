import {Observable} from "rxjs";
import {Dictionary} from "lodash";
import {QuizResult} from "../Manager/QuizManager";
import {map, withLatestFrom} from "rxjs/operators";
import {SRM} from "../Scheduling/SRM";
import {ScheduleRow} from "../ReactiveClasses/schedule-row.interface";

export const QuizResultToRecognitionRows =
    (
        scheduleRows$: Observable<Dictionary<ScheduleRow>>,
        ms: SRM
    ) =>
        (obs$: Observable<QuizResult>) =>
            obs$.pipe(
                withLatestFrom(scheduleRows$),
                map(([scorePair, wordScheduleRowDict]) => {
                    const previousRecords = wordScheduleRowDict[scorePair.word]?.wordRecognitionRecords || []
                    const nextRecognitionRecord = ms.getNextRecognitionRecord(
                        previousRecords,
                        scorePair.score,
                        new Date()
                    );
                    return [{
                        word: scorePair.word,
                        timestamp: new Date(),
                        ...nextRecognitionRecord
                    }];
                })
            )
