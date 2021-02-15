import {combineLatest, Observable} from "rxjs";
import {map, shareReplay, startWith} from "rxjs/operators";
import {ds_Dict} from "../Tree/DeltaScanner";
import {IndexedRowsRepository} from "../schedule/indexed-rows.repository";
import {WordRecognitionRow} from "../schedule/word-recognition-row";
import {PronunciationProgressRepository} from "../schedule/pronunciation-progress.repository";
import {DocumentWordCount} from "../interfaces/DocumentWordCount";
import CardsRepository from "./cards.repository";
import {IgnoredWordsRepository} from "../schedule/ignored-words.repository";
import {ScheduleRow} from "../schedule/ScheduleRow";
import {NormalizedScheduleRowData, ScheduleRowData} from "../schedule/schedule-row.interface";
import {ScheduleMathService} from "./schedule-math.service";
import {isChineseCharacter} from "../interfaces/OldAnkiClasses/Card";
import {ModesService} from "../modes/modes.service";
import {SettingsService} from "../../services/settings.service";

export class ScheduleRowsService {
    public indexedScheduleRows$: Observable<ds_Dict<ScheduleRow<NormalizedScheduleRowData>>>;

    constructor({
                    wordRecognitionProgressService,
                    readingWordCounts$,
                    pronunciationProgressService,
                    cardsRepository,
                    ignoredWordsRepository,
        settingsService
                }: {
        wordRecognitionProgressService: IndexedRowsRepository<WordRecognitionRow>,
        pronunciationProgressService: PronunciationProgressRepository
        readingWordCounts$: Observable<ds_Dict<DocumentWordCount[]>>,
        cardsRepository: CardsRepository,
        ignoredWordsRepository: IgnoredWordsRepository,
        settingsService: SettingsService
    }) {
        this.indexedScheduleRows$ = combineLatest([
            wordRecognitionProgressService.records$.pipe(startWith({})),
            readingWordCounts$.pipe(startWith({})),
            pronunciationProgressService.records$,
            cardsRepository.cardIndex$,
            ignoredWordsRepository.latestRecords$,
            settingsService.frequencyWeight$
        ]).pipe(
            map(([wordRecognitionRowIndex, wordCounts, pronunciationRowIndex, cardIndex, ignoredWords, frequencyWeight]) => {
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

                /**
                 * Prevent cards created only for visual purposes from showing up in the quiz rows
                 */
                Object.entries(wordCounts).filter(
                    ([word]) => cardIndex[word]?.find(card => !card.highlightOnly)
                ).forEach(([word, wordCountRecords]) => {
                    const w = cardIndex[word];
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
                    1 - frequencyWeight,
                    frequencyWeight,
                ).entries())
/*
                return Object.fromEntries(Object.entries(scheduleRows).map(([word, scheduleRowData]) => [
                    word,
                    new ScheduleRow(scheduleRowData)
                ]));
*/
            }),
            shareReplay(1)
        );
    }


}