import {Observable} from "rxjs";
import {Dictionary} from "lodash";
import {QuizResult} from "../manager/QuizManager";
import {map, withLatestFrom} from "rxjs/operators";
import {SrmService} from "../srm/srm.service";
import {WordRecognitionRow} from "../schedule/word-recognition-row";
import moment from "moment";
import {QuizScheduleRowData, ScheduleRow} from "../schedule/schedule-row";

export const QuizResultToRecognitionRows =
    (
        scheduleRows$: Observable<Dictionary<ScheduleRow<QuizScheduleRowData>>>,
    ) =>
        (obs$: Observable<QuizResult>) =>
            obs$.pipe(
                withLatestFrom(scheduleRows$),
                map(([scorePair, wordScheduleRowDict]): WordRecognitionRow => {
                    const previousRecords = wordScheduleRowDict[scorePair.word]?.d.wordRecognitionRecords || []
                    const nextRecognitionRecord = SrmService.getNextRecognitionRecord(
                        previousRecords,
                        scorePair.grade,
                    );
                    return {
                        word: scorePair.word,
                        timestamp: new Date(),
                        ...nextRecognitionRecord,
                        nextDueDate: moment().add(nextRecognitionRecord.interval, 'day').toDate(),
                        grade: scorePair.grade,
                    };
                })
            )
