import { combineLatest, Observable } from 'rxjs'
import { debounceTime, map, shareReplay } from 'rxjs/operators'
import { QuizScheduleRowData, ScheduleRow, SortQuizData, SpacedSortQuizData } from './schedule-row'
import { ScheduleMathService, sumWordCountRecords } from './schedule-math.service'
import { SettingsService } from '../../services/settings.service'
import { TranslationAttemptService } from '../../components/translation-attempt/translation-attempt.service'
import { TimeService } from '../time/time.service'
import { FlashCardLearningTargetsService } from './learning-target/flash-card-learning-targets.service'
import { ScheduleRowsService } from './schedule-rows-service.interface'
import { flatten, orderBy } from 'lodash'
import { IndexedRowsRepository } from './indexed-rows.repository'
import { WordRecognitionRow } from './word-recognition-row'
import { TabulationService } from '../tabulation/tabulation.service'
import { FlashCardTypesRequiredToProgressService } from './required-to-progress.service'
import { spaceOutRows } from './space-out-rows'
import { pipeLog } from '../manager/pipe.log'
import {SpacedScheduleRow} from "../manager/space-schedule-row.type";

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

export class QuizCardScheduleRowsService implements ScheduleRowsService<SortQuizData> {
    public scheduleRows$: Observable<SpacedScheduleRow[]>

    constructor(
        {
            settingsService,
            translationAttemptService,
            timeService,
            flashCardLearningTargetsService,
            wordRecognitionProgressRepository,
            tabulationService,
            flashCardTypesRequiredToProgressService,
        }: {
            settingsService: SettingsService
            translationAttemptService: TranslationAttemptService
            timeService: TimeService,
            flashCardLearningTargetsService: FlashCardLearningTargetsService,
            wordRecognitionProgressRepository: IndexedRowsRepository<WordRecognitionRow>
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
                flashCardTypesRequiredToProgressService.activeFlashCardTypes$.pipe(pipeLog('quiz-schedule-rows:activeFlashCardTypes')),
            ]),
            combineLatest([
/*
                translationAttemptService.currentScheduleRow$.pipe(pipeLog("quiz-schedule-rows:currentScheduleRow")),
*/
                flashCardLearningTargetsService.learningTargets$.pipe(pipeLog("quiz-schedule-rows:learningTargets")),
            ]),
            wordRecognitionProgressRepository.indexOfOrderedRecords$.pipe(pipeLog('quiz-schedule-rows:wordRecognitionProgressRecords')),
            tabulationService.tabulation$.pipe(pipeLog('quiz-schedule-rows:tabulation')),
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
                         // currentTranslationAttemptScheduleRow,
                         learningTargets,
                     ],
                     wordRecognitionRowIndex,
                     tabulation,
                 ]) => {
                    // const firstRecordSentence = currentTranslationAttemptScheduleRow?.d?.segmentText || ''
                    const learningTargetsList = [...learningTargets.values()]
                    const sortedRows = ScheduleMathService.normalizeAndSortQuizScheduleRows(
                        getSortConfigs({
                            dateWeight,
                            frequencyWeight,
                            wordLengthWeight,
                            firstRecordSentence: "",
                            translationAttemptSentenceWeight,
                        }),
                        flatten(learningTargetsList
                            .filter(learningTarget => {
                                return wordRecognitionRowIndex[learningTarget.word]?.length || tabulation.wordCountMap.get(learningTarget.word)?.length;
                            })
                            .map(
                            (learningTarget) => {
                                return flashCardTypesRequiredToProgress.map(flash_card_type => {
                                        const wordRecognitionRecords = (wordRecognitionRowIndex[learningTarget.word] || []).filter(recognitionRow => recognitionRow.flash_card_type === flash_card_type)
                                        return new ScheduleRow<QuizScheduleRowData>(
                                            {
                                                ...learningTarget,
                                                wordRecognitionRecords,
                                                wordCountRecords: (tabulation.wordCountMap.get(learningTarget.word) || []).map(v => ({
                                                    ...v,
                                                    document: '',
                                                })),
                                                greedyWordCountRecords: [],
                                                flash_card_type,
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
                    const spacedOutRowMap = spaceOutRows(
                        row => ({
                            type: row.row.d.word,
                            subType: row.row.d.flash_card_type,
                            sortValue: row.row.dueDate().getTime(),
                        }),
                        // This order by is necessary or the offset wont do anything
                        orderBy(sortedRows, v => `${v.row.d.word}${v.row.d.flash_card_type}`),
                        1000 * 60 * 10,
                    )

                    return sortedRows.map((row) => new ScheduleRow<SpacedSortQuizData>(
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
                            spacedDueDate: {
                                source: row.row.dueDate(),
                                transformed: new Date(spacedOutRowMap.get(row) as number),
                            },
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
