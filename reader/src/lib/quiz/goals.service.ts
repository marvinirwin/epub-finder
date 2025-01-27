import { SettingsService } from '../../services/settings.service'
import { IndexedRowsRepository } from '../schedule/indexed-rows.repository'
import { WordRecognitionRow } from '../schedule/word-recognition-row'
import { PronunciationProgressRepository } from '../schedule/pronunciation-progress.repository'
import { combineLatest, Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { RecognitionMap } from '../srm/srm.service'

const isInToday = (inputDate: Date) => {
    const today = new Date()
    return today.setHours(0, 0, 0, 0) == inputDate.setHours(0, 0, 0, 0)
}

export class GoalsService {
    public dailyGoalFraction$: Observable<[number, number]>
    private dailyProgress$: Observable<number>
    constructor({
        settingsService,
        wordRecognitionProgressRepository,
        pronunciationProgressService,
    }: {
        settingsService: SettingsService
        wordRecognitionProgressRepository: IndexedRowsRepository<WordRecognitionRow>
        pronunciationProgressService: PronunciationProgressRepository
    }) {
        this.dailyProgress$ = combineLatest([
            wordRecognitionProgressRepository.indexOfOrderedRecords$,
            pronunciationProgressService.indexOfOrderedRecords$,
        ]).pipe(
            map(([recognition, pronunciation]) => {
                /**
                 * This method could be made way more efficient
                 * if each of these scores was calculated outside of combineLatest
                 */
                const wordsRecognizedToday = Object.values(
                    recognition,
                ).filter((recordsForword) =>
                    recordsForword.find(
                        (r) => r.grade >= 3 && isInToday(r.created_at),
                    ),
                )
                const wordsPronouncedToday = Object.values(
                    pronunciation,
                ).filter((recordsForword) =>
                    recordsForword.find(
                        (r) => r.success && isInToday(r.created_at),
                    ),
                )
                return wordsRecognizedToday.length + wordsPronouncedToday.length
            }),
            shareReplay(1),
        )
        this.dailyGoalFraction$ = combineLatest([
            this.dailyProgress$,
            settingsService.dailyGoal$.obs$,
        ]).pipe(
            map(([currentProgress, dailyGoal]): [number, number] => [
                currentProgress,
                dailyGoal,
            ]),
            shareReplay(1),
        )
    }
}
