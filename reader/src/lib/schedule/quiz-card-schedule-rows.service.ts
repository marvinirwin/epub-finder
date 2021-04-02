import { combineLatest, Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { NormalizedQuizCardScheduleRowData, QuizScheduleRowData, ScheduleRow } from './schedule-row'
import { ScheduleMathService, sumWordCountRecords } from './schedule-math.service'
import { SettingsService } from '../../services/settings.service'
import { TranslationAttemptService } from '../../components/translation-attempt/translation-attempt.service'
import { TimeService } from '../time/time.service'
import { FlashCardLearningTargetsService } from './learning-target/flash-card-learning-targets.service'
import { ScheduleRowsService } from './schedule-rows-service.interface'
import { flatten } from 'lodash'

function getSortConfigs({
                            dateWeight,
                            frequencyWeight,
                            wordLengthWeight,
                            firstRecordSentence,
                            translationAttemptSentenceWeight,
                        }: {
    dateWeight: number,
    frequencyWeight: number,
    wordLengthWeight: number, firstRecordSentence: string, translationAttemptSentenceWeight: number
}) {
    return {
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
    }
}

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
                settingsService.flashCardTypesRequiredToProgress$,
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
                         flashCardTypesRequiredToProgress,
                     ],
                     currentTranslationAttemptScheduleRow,
                     now,
                     learningTargets,
                 ]) => {
                    const firstRecordSentence = currentTranslationAttemptScheduleRow?.d?.segmentText || ''
                    const learningTargetsList = [...learningTargets.values()]
                    return ScheduleMathService.normalizeAndSortQuizScheduleRows(
                        getSortConfigs({
                            dateWeight,
                            frequencyWeight,
                            wordLengthWeight,
                            firstRecordSentence,
                            translationAttemptSentenceWeight,
                        }),
                        flatten(learningTargetsList.map(
                            (learningTarget) =>
                                flashCardTypesRequiredToProgress.map(configuration => new ScheduleRow<QuizScheduleRowData>(
                                    { ...learningTarget, flashCardType: configuration },
                                    learningTarget.wordRecognitionRecords,
                                    ),
                                ),
                        )),
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
