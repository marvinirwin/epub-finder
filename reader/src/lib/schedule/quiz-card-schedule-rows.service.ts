import {combineLatest, Observable} from "rxjs";
import {map, shareReplay, startWith} from "rxjs/operators";
import {ds_Dict} from "../delta-scan/delta-scan.module";
import {IndexedRowsRepository} from "./indexed-rows.repository";
import {WordRecognitionRow} from "./word-recognition-row";
import {PronunciationProgressRepository} from "./pronunciation-progress.repository";
import CardsRepository from "../manager/cards.repository";
import {IgnoredWordsRepository} from "./ignored-words.repository";
import {NormalizedQuizCardScheduleRowData, QuizScheduleRowData, ScheduleRow} from "./schedule-row";
import {ScheduleMathService, sumWordCountRecords} from "./schedule-math.service";
import {SettingsService} from "../../services/settings.service";
import {AllWordsRepository} from "../all-words.repository";
import {OpenDocumentsService} from "../manager/open-documents.service";
import {TranslationAttemptService} from "../../components/translation-attempt/translation-attempt.service";
import {SelectedVirtualTabulationsService} from "../manager/selected-virtual-tabulations.service";
import {SerializedTabulationAggregate} from "../../../../server/src/shared/tabulation/serialized-tabulation.aggregate";

export class QuizCardScheduleRowsService {
    public indexedScheduleRows$: Observable<ds_Dict<ScheduleRow<NormalizedQuizCardScheduleRowData>>>;

    constructor({
                    wordRecognitionProgressService,
                    openDocumentsService,
                    pronunciationProgressService,
                    cardsRepository,
                    ignoredWordsRepository,
                    settingsService,
                    allWordsRepository,
                    translationAttemptService,
                    selectedVirtualTabulationsService
                }: {
        wordRecognitionProgressService: IndexedRowsRepository<WordRecognitionRow>,
        pronunciationProgressService: PronunciationProgressRepository
        openDocumentsService: OpenDocumentsService
        cardsRepository: CardsRepository,
        ignoredWordsRepository: IgnoredWordsRepository,
        settingsService: SettingsService,
        allWordsRepository: AllWordsRepository,
        translationAttemptService: TranslationAttemptService,
        selectedVirtualTabulationsService: SelectedVirtualTabulationsService
    }) {
        const progress$ = combineLatest([
            wordRecognitionProgressService.indexOfOrderedRecords$.pipe(startWith({})),
            pronunciationProgressService.indexOfOrderedRecords$,
        ])
        this.indexedScheduleRows$ = combineLatest([
            progress$,
            combineLatest([
                selectedVirtualTabulationsService.selectedVirtualTabulations$,
                cardsRepository.cardIndex$,
                ignoredWordsRepository.latestRecords$,
            ]),
            combineLatest([
                settingsService.frequencyWeight$,
                settingsService.dateWeight$,
                settingsService.wordLengthWeight$,
                settingsService.translationAttemptSentenceWeight$
            ]),
            allWordsRepository.all$,
            translationAttemptService.currentScheduleRow$
        ]).pipe(
            map(([
                     [wordRecognitionRowIndex, pronunciationRowIndex],
                     [
                         selectedVirtualTabulations,
                         cardIndex,
                         ignoredWords,
                     ],
                     [frequencyWeight, dateWeight, wordLengthWeight, translationAttemptSentenceWeight],
                     allWords,
                     currentTranslationAttemptScheduleRow
                 ]) => {
                const scheduleRows: ds_Dict<QuizScheduleRowData> = {};
                const ensureScheduleRow = (word: string) => {
                    if (!scheduleRows[word]) {
                        scheduleRows[word] = {
                            wordCountRecords: [],
                            word,
                            wordRecognitionRecords: [],
                            pronunciationRecords: [],
                            greedyWordCountRecords: []
                        } as QuizScheduleRowData;
                    }
                    return scheduleRows[word];
                };

                allWords.forEach(word => {
                    ensureScheduleRow(word)
                })
                new SerializedTabulationAggregate(selectedVirtualTabulations).serializedTabulations.forEach(({documentWordCounts}) => {
                    /**
                     * Prevent cards created only for visual purposes from showing up in the quiz rows
                     */
                    Object.entries(documentWordCounts).forEach(([word, wordCountRecords]) => {
                        if (scheduleRows[word]) {
                            scheduleRows[word].wordCountRecords.push(...wordCountRecords)
                        }
                    });
                })

                Object.entries(pronunciationRowIndex).forEach(([word, pronunciationRecords]) => {
                    if (scheduleRows[word]) {
                        scheduleRows[word].pronunciationRecords.push(...pronunciationRecords);
                    }
                });
                Object.entries(wordRecognitionRowIndex).forEach(([word, wordRecognitionRecords]) => {
                    scheduleRows[word]?.wordRecognitionRecords.push(...wordRecognitionRecords);
                });
                ignoredWords.forEach(({word}) => delete scheduleRows[word]);
                const firstRecordSentence = currentTranslationAttemptScheduleRow?.d?.segmentText || '';
                return Object.fromEntries(ScheduleMathService.normalizeAndSortQuizScheduleRows(
                    {
                        dueDate: {
                            fn: (row: ScheduleRow<QuizScheduleRowData>) => row.dueDate().getTime() * -1,
                            weight: dateWeight
                        },
                        count: {
                            fn: (row: ScheduleRow<QuizScheduleRowData>) => sumWordCountRecords(row),
                            weight: frequencyWeight,
                        },
                        length: {
                            fn: (row: ScheduleRow<QuizScheduleRowData>) => row.d.word.length,
                            weight: wordLengthWeight
                        },
                        // How do we tell if we're included in the first row?
                        sentencePriority: {
                            fn: (row: ScheduleRow<QuizScheduleRowData>) => {
                                return firstRecordSentence.includes(row.d.word);
                            },
                            weight: translationAttemptSentenceWeight
                        }
                    },
                    Object.values(scheduleRows)
                        .map(r => new ScheduleRow<QuizScheduleRowData>(r, r.wordRecognitionRecords)),
                    ([dueDate, count, length, sentencePriority], sortConfigs) => {
                        return {
                            dueDate,
                            count,
                            length,
                            sentencePriority
                        }
                    }
                ).filter(row => !!row.row.d.word).map(row => [
                    row.row.d.word,
                    new ScheduleRow<NormalizedQuizCardScheduleRowData>(
                        {
                            ...row.row.d,
                            ...row.sortValues,
                            finalSortValue: row.finalSortValue,
                            normalizedCount: row.sortValues.count.normalizedValueObject,
                            normalizedDate: row.sortValues.dueDate.normalizedValueObject,
                            sortValues: row.sortValues
                        },
                        row.row.d.wordRecognitionRecords
                    )
                ]))
            }),
            shareReplay(1)
        );
    }


}