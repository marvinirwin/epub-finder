import { combineLatest, Observable } from 'rxjs'
import { debounceTime, map, shareReplay } from 'rxjs/operators'
import { NormalizedQuizCardScheduleRowData, QuizScheduleRowData, ScheduleRow } from './schedule-row'
import { ScheduleMathService, sumWordCountRecords } from './schedule-math.service'
import { SettingsService } from '../../services/settings.service'
import { TranslationAttemptService } from '../../components/translation-attempt/translation-attempt.service'
import { TimeService } from '../time/time.service'
import { FlashCardLearningTargetsService } from './learning-target/flash-card-learning-targets.service'
import { ScheduleRowsService } from './schedule-rows-service.interface'
import { flatten } from 'lodash'
import { LanguageConfigsService } from '../language/language-configs.service'
import { FlashCardType } from '../quiz/hidden-quiz-fields'
import { IndexedRowsRepository } from './indexed-rows.repository'
import { WordRecognitionRow } from './word-recognition-row'
import { TabulationService } from '../tabulation/tabulation.service'
import { FlashCardTypesRequiredToProgressService } from './required-to-progress.service'

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
            wordRecognitionProgressService,
            tabulationService,
            flashCardTypesRequiredToProgressService
        }: {
            settingsService: SettingsService
            translationAttemptService: TranslationAttemptService
            timeService: TimeService,
            flashCardLearningTargetsService: FlashCardLearningTargetsService,
            wordRecognitionProgressService: IndexedRowsRepository<WordRecognitionRow>
            tabulationService: TabulationService
            flashCardTypesRequiredToProgressService: FlashCardTypesRequiredToProgressService
        },
    ) {
        this.scheduleRows$ = combineLatest([
            combineLatest([
                settingsService.frequencyWeight$,
                settingsService.dateWeight$,
                settingsService.wordLengthWeight$,
                settingsService.translationAttemptSentenceWeight$,
                flashCardTypesRequiredToProgressService.activeFlashCardTypes$
            ]),
            combineLatest([
                translationAttemptService.currentScheduleRow$,
                timeService.quizNow$,
                flashCardLearningTargetsService.learningTargets$,
            ]),
            wordRecognitionProgressService.indexOfOrderedRecords$,
            tabulationService.tabulation$
        ]).pipe(
            // Prevent this from firing synchronously
            debounceTime(0),
            map(
                ([
                     [
                         frequencyWeight,
                         dateWeight,
                         wordLengthWeight,
                         translationAttemptSentenceWeight,
                         flashCardTypesRequiredToProgress,
                     ],
                     [
                         currentTranslationAttemptScheduleRow,
                         now,
                         learningTargets,
                     ],
                    wordRecognitionRowIndex,
                    tabulation
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
                            (learningTarget) => {
                                return flashCardTypesRequiredToProgress.map(flashCardType => {
                                        const wordRecognitionRecords = (wordRecognitionRowIndex[learningTarget.word] || []).filter(recognitionRow => recognitionRow.flashCardType === flashCardType)
                                        return new ScheduleRow<QuizScheduleRowData>(
                                            {
                                                ...learningTarget,
                                                wordRecognitionRecords,
                                                wordCountRecords: (tabulation.wordCountMap.get(learningTarget.word) || []).map(v => ({...v, document: ''})),
                                                greedyWordCountRecords: [],
                                                flashCardType
                                            },
                                            wordRecognitionRecords,
                                        )
                                    },
                                )
                            },
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
