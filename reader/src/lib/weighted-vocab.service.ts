import {QuizCardScheduleRowsService} from "./schedule/quiz-card-schedule-rows.service";
import {Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {WordRecognitionProgressRepository} from "./schedule/word-recognition-progress.repository";
import {recordsLearnedToday} from "./schedule/schedule-row";

export class WeightedVocabService {
    weightedVocab$: Observable<Map<string, number>>

    constructor(
        {
            wordRecognitionProgressService
        }: {
            wordRecognitionProgressService: WordRecognitionProgressRepository
        }
    ) {
        this.weightedVocab$ = wordRecognitionProgressService
            .indexOfOrderedRecords$
            .pipe(
                map((indexedWordRecognitionRecords) => {
                    return new Map(
                        Object.values(indexedWordRecognitionRecords)
                            .map(recognitionRecords => {
                                const lastRecord = recognitionRecords[recognitionRecords.length - 1];
                                return [
                                    lastRecord.word,
                                    recordsLearnedToday(recognitionRecords) ? 1 : 0
                                ];
                            })
                    )
                }),
                shareReplay(1)
            )
    }
}