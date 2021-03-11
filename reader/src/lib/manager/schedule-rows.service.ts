import {combineLatest, Observable} from "rxjs";
import {map, shareReplay, startWith} from "rxjs/operators";
import {ds_Dict} from "../delta-scan/delta-scan.module";
import {IndexedRowsRepository} from "../schedule/indexed-rows.repository";
import {WordRecognitionRow} from "../schedule/word-recognition-row";
import {PronunciationProgressRepository} from "../schedule/pronunciation-progress.repository";
import {DocumentWordCount} from "../../../../server/src/shared/DocumentWordCount";
import CardsRepository from "./cards.repository";
import {IgnoredWordsRepository} from "../schedule/ignored-words.repository";
import {NormalizedScheduleRowData, ScheduleRow, ScheduleRowData} from "../schedule/schedule-row";
import {ScheduleMathService} from "./schedule-math.service";
import {SettingsService} from "../../services/settings.service";
import {AllWordsRepository} from "../all-words.repository";
import {OpenDocumentsService} from "./open-documents.service";

export class ScheduleRowsService {
    public indexedScheduleRows$: Observable<ds_Dict<ScheduleRow<NormalizedScheduleRowData>>>;

    constructor({
                    wordRecognitionProgressService,
                    openDocumentsService,
                    pronunciationProgressService,
                    cardsRepository,
                    ignoredWordsRepository,
                    settingsService,
                    allWordsRepository,
                }: {
        wordRecognitionProgressService: IndexedRowsRepository<WordRecognitionRow>,
        pronunciationProgressService: PronunciationProgressRepository
        openDocumentsService: OpenDocumentsService
        cardsRepository: CardsRepository,
        ignoredWordsRepository: IgnoredWordsRepository,
        settingsService: SettingsService,
        allWordsRepository: AllWordsRepository
    }) {
        const progress$ = combineLatest([
            wordRecognitionProgressService.records$.pipe(startWith({})),
            pronunciationProgressService.records$,
        ])
        this.indexedScheduleRows$ = combineLatest([
            progress$,
            openDocumentsService.virtualDocumentTabulation$,
            cardsRepository.cardIndex$,
            ignoredWordsRepository.latestRecords$,
            combineLatest([
                settingsService.frequencyWeight$,
                settingsService.dateWeight$,
                settingsService.wordLengthWeight$
            ]),
            allWordsRepository.all$
        ]).pipe(
            map(([
                     [wordRecognitionRowIndex, pronunciationRowIndex],
                     wordCounts,
                     cardIndex,
                     ignoredWords,
                     [frequencyWeight, dateWeight, wordLengthWeight],
                     allWords
                 ]) => {
                const scheduleRows: ds_Dict<ScheduleRowData> = {};
                const ensureScheduleRow = (word: string) => {
                    if (!scheduleRows[word]) {
                        scheduleRows[word] = {
                            wordRecognitionRecords: [],
                            wordCountRecords: [],
                            word,
                            pronunciationRecords: [],
                            greedyWordCountRecords: []
                        } as ScheduleRowData;
                    }
                    return scheduleRows[word];
                };

                allWords.forEach(word => {
                    ensureScheduleRow(word)
                })
                wordCounts.serializedTabulations.forEach(({greedyDocumentWordCounts}) => {
                    /**
                     * Prevent cards created only for visual purposes from showing up in the quiz rows
                     */
                    [...greedyDocumentWordCounts.entries()].filter(
                        ([word]) => cardIndex[word]?.find(card => !card.highlightOnly)
                    ).forEach(([word, wordCountRecords]) => {
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
                return Object.fromEntries(ScheduleMathService.sortScheduleRows(
                    Object.values(scheduleRows).map(r => new ScheduleRow(r)),
                    {
                        dateWeight,
                        countWeight: frequencyWeight,
                        wordLengthWeight
                    }
                ).map(row => [row.d.word, row]))
            }),
            shareReplay(1)
        );
    }


}