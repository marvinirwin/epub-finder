import {SettingsService} from "../services/settings.service";
import {ProgressRowService} from "./schedule/progress-row.service";
import {WordRecognitionRow} from "./schedule/word-recognition-row";
import {PronunciationProgressService} from "./schedule/pronunciation-progress.service";
import {combineLatest, Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {flatten} from "lodash";
import {RecognitionMap} from "./srm/srm.service";


const isInToday = (inputDate: Date) => {
    const today = new Date();
    return today.setHours(0, 0, 0, 0) == inputDate.setHours(0, 0, 0, 0);
}

export class GoalsService {
    public dailyProgressFraction$: Observable<[number, number]>;
    private dailyProgress$: Observable<number>;
    constructor({
        settingsService,
                    recognitionRecordsService,
                    pronunciationRecordsService
                }: {
        settingsService: SettingsService,
        recognitionRecordsService: ProgressRowService<WordRecognitionRow>,
        pronunciationRecordsService: PronunciationProgressService
    }) {
        this.dailyProgress$ = combineLatest([
            recognitionRecordsService.records$,
            pronunciationRecordsService.records$
        ]).pipe(
            map(([recognition, pronunciation]) => {
                /**
                 * This method could be made way more efficient
                 * if each of these scores was calculated outside of combineLatest
                 */
                const wordsRecognizedToday = Object.values(recognition)
                    .filter(recordsForWord => recordsForWord
                        .find(r =>
                            r.recognitionScore === RecognitionMap.easy &&
                            isInToday(r.timestamp)
                        )
                    );
                const wordsPronouncedToday = Object.values(pronunciation)
                    .filter(recordsForWord => recordsForWord
                        .find(r =>
                            r.success &&
                            isInToday(r.timestamp)
                        )
                    );
                return wordsRecognizedToday.length + wordsPronouncedToday.length
            }),
            shareReplay(1)
        )
        this.dailyProgressFraction$ = combineLatest([
            this.dailyProgress$,
            settingsService.dailyGoal$
        ]).pipe(
            map(([currentProgress, dailyGoal]): [number, number] => [currentProgress, dailyGoal]),
            shareReplay(1)
        )
    }
}