import {Observable} from "rxjs";
import {Dictionary} from "lodash";
import {ICard} from "../Interfaces/ICard";
import {ScheduleRow} from "../ReactiveClasses/ScheduleRow";
import {QuizResult} from "../Manager/QuizManager";
import {map, withLatestFrom} from "rxjs/operators";
import {SRM} from "../Scheduling/SRM";

export const QuizResultToRecognitionRow =
    (
        scheduleRows$: Observable<Dictionary<ScheduleRow>>,
        ms: SRM
    ) =>
        (obs$: Observable<QuizResult>) =>
            obs$.pipe(
                withLatestFrom(scheduleRows$),
                map(([scorePair, wordScheduleRowDict]) => {
                    let previousRecords = wordScheduleRowDict[scorePair.word]?.wordRecognitionRecords || []
                    let nextRecognitionRecord = ms.getNextRecognitionRecord(
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
