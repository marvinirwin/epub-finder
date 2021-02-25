import {combineLatest, Observable} from "rxjs";
import {map, shareReplay, startWith} from "rxjs/operators";
import {ds_Dict} from "../Tree/DeltaScanner";
import {IndexedRowsRepository} from "../schedule/indexed-rows.repository";
import {WordRecognitionRow} from "../schedule/word-recognition-row";
import {PronunciationProgressRepository} from "../schedule/pronunciation-progress.repository";
import {DocumentWordCount} from "../../../../server/src/shared/DocumentWordCount";
import CardsRepository from "./cards.repository";
import {IgnoredWordsRepository} from "../schedule/ignored-words.repository";
import {ScheduleRow} from "../schedule/ScheduleRow";
import {NormalizedScheduleRowData, ScheduleRowData} from "../schedule/schedule-row.interface";
import {ScheduleMathService} from "./schedule-math.service";
import {SettingsService} from "../../services/settings.service";
import {AllWordsRepository} from "../all-words.repository";

export class ScheduleRowsService {
    public indexedScheduleRows$: Observable<ds_Dict<ScheduleRow<NormalizedScheduleRowData>>>;

    constructor({
                    wordRecognitionProgressService,
                    readingWordCounts$,
                    pronunciationProgressService,
                    cardsRepository,
                    ignoredWordsRepository,
                    settingsService,
                    allWordsRepository
                }: {
        wordRecognitionProgressService: IndexedRowsRepository<WordRecognitionRow>,
        pronunciationProgressService: PronunciationProgressRepository
        readingWordCounts$: Observable<ds_Dict<DocumentWordCount[]>>,
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
            readingWordCounts$.pipe(startWith({})),
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
                        } as ScheduleRowData;
                    }
                    return scheduleRows[word];
                };

                allWords.forEach(word => {
                    ensureScheduleRow(word)
                })

                /**
                 * Prevent cards created only for visual purposes from showing up in the quiz rows
                 */
                Object.entries(wordCounts).filter(
                    ([word]) => cardIndex[word]?.find(card => !card.highlightOnly)
                ).forEach(([word, wordCountRecords]) => {
                    ensureScheduleRow(word).wordCountRecords.push(...wordCountRecords);
                });
                Object.entries(pronunciationRowIndex).forEach(([word, pronunciationRecords]) => {
                    ensureScheduleRow(word).pronunciationRecords.push(...pronunciationRecords);
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