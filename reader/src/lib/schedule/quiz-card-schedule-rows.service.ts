import { combineLatest, Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { ds_Dict } from '../delta-scan/delta-scan.module'
import { NormalizedQuizCardScheduleRowData, QuizScheduleRowData, ScheduleRow } from './schedule-row'
import { ScheduleMathService, sumWordCountRecords } from './schedule-math.service'
import { SettingsService } from '../../services/settings.service'
import { TranslationAttemptService } from '../../components/translation-attempt/translation-attempt.service'
import { TimeService } from '../time/time.service'
import { FlashCardLearningTargetsService } from './learning-target/flash-card-learning-targets.service'
import { ScheduleRowsService } from './schedule-rows-service.interface'

export class QuizCardScheduleRowsService implements ScheduleRowsService<NormalizedQuizCardScheduleRowData> {
    public scheduleRows$: Observable<ScheduleRow<NormalizedQuizCardScheduleRowData>[]>

    constructor(
        {
            settingsService,
            translationAttemptService,
            timeService,
            flashCardLearningTargetsService,
        }: {
            settingsService: SettingsService
            translationAttemptService: TranslationAttemptService
            timeService: TimeService,
            flashCardLearningTargetsService: FlashCardLearningTargetsService
        },
    ) {
        this.scheduleRows$ = combineLatest([
            combineLatest([
                settingsService.frequencyWeight$,
                settingsService.dateWeight$,
                settingsService.wordLengthWeight$,
                settingsService.translationAttemptSentenceWeight$,
                settingsService.quizCardConfigurations$
            ]),
            translationAttemptService.currentScheduleRow$,
            timeService.quizNow$,
            flashCardLearningTargetsService.learningTargets$,
        ]).pipe(
            map(
                ([
                     [
                         frequencyWeight,
                         dateWeight,
                         wordLengthWeight,
                         translationAttemptSentenceWeight,
                     ],
                     currentTranslationAttemptScheduleRow,
                     now,
                     scheduleRows,
                 ]) => {
                    const firstRecordSentence =
                        currentTranslationAttemptScheduleRow?.d?.segmentText ||
                        ''
                    return ScheduleMathService.normalizeAndSortQuizScheduleRows(
                        {
                            dueDate: {
                                fn: (
                                    row: ScheduleRow<QuizScheduleRowData>,
                                ) => row.dueDate().getTime() * -1,
                                weight: dateWeight,
                            },
                            count: {
                                fn: (
                                    row: ScheduleRow<QuizScheduleRowData>,
                                ) => sumWordCountRecords(row),
                                weight: frequencyWeight,
                            },
                            length: {
                                fn: (
                                    row: ScheduleRow<QuizScheduleRowData>,
                                ) => row.d.word.length,
                                weight: wordLengthWeight,
                            },
                            // How do we tell if we're included in the first row?
                            sentencePriority: {
                                fn: (
                                    row: ScheduleRow<QuizScheduleRowData>,
                                ) => {
                                    return firstRecordSentence.includes(
                                        row.d.word,
                                    )
                                },
                                weight: translationAttemptSentenceWeight,
                            },
                        },
                        [...scheduleRows.values()].map(
                            (r) =>
                                new ScheduleRow<QuizScheduleRowData>(
                                    r,
                                    r.wordRecognitionRecords,
                                ),
                        ),
                        (
                            [dueDate, count, length, sentencePriority],
                            sortConfigs,
                        ) => {
                            return {
                                dueDate,
                                count,
                                length,
                                sentencePriority,
                            }
                        },
                    ).filter((row) => !!row.row.d.word)
                        .map((row) => new ScheduleRow<NormalizedQuizCardScheduleRowData>(
                            {
                                ...row.row.d,
                                ...row.sortValues,
                                finalSortValue: row.finalSortValue,
                                normalizedCount:
                                row.sortValues.count
                                    .normalizedValueObject,
                                normalizedDate:
                                row.sortValues.dueDate
                                    .normalizedValueObject,
                                sortValues: row.sortValues,
                            },
                            row.row.d.wordRecognitionRecords,
                            ),
                        )
                },
            ),
            shareReplay(1),
        )
    }
}
