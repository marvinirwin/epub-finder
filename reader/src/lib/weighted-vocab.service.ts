import {QuizCardScheduleRowsService} from "./schedule/quiz-card-schedule-rows.service";
import {Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";

export class WeightedVocabService {
    weightedVocab$: Observable<Map<string, number>>

    constructor(
        {
            quizCardScheduleRowsService
        }: {
            quizCardScheduleRowsService: QuizCardScheduleRowsService
        }
    ) {
        this.weightedVocab$ = quizCardScheduleRowsService
            .indexedScheduleRows$
            .pipe(
                map((indexedScheduleRows) => {
                    return new Map(
                        Object.values(indexedScheduleRows)
                            .map(scheduleRow => [
                                scheduleRow.d.word,
                                scheduleRow.isRecognized() ? 1 : 0
                            ])
                    )
                }),
                shareReplay(1)
            )
    }
}