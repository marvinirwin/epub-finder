import {combineLatest, Observable} from "rxjs";
import {map, shareReplay, startWith} from "rxjs/operators";
import {ds_Dict} from "../Tree/DeltaScanner";
import {IndexedRowsRepository} from "../schedule/indexed-rows.repository";
import {WordRecognitionRow} from "../schedule/word-recognition-row";
import {PronunciationProgressRepository} from "../schedule/pronunciation-progress.repository";
import {DocumentWordCount} from "../Interfaces/DocumentWordCount";
import CardsRepository from "./cards.repository";
import {IgnoredWordsRepository} from "../schedule/ignored-words.repository";
import {ScheduleRow} from "../schedule/ScheduleRow";
import {NormalizedScheduleRowData, ScheduleRowData} from "../schedule/schedule-row.interface";

export class ScheduleRowsService {
    public indexedScheduleRows$: Observable<ds_Dict<ScheduleRow>>;

    constructor({
                    recognitionRecordsService,
                    wordCounts$,
                    pronunciationRecordsService,
                    cardsRepository,
                    ignoredWordsRepository
                }: {
        recognitionRecordsService: IndexedRowsRepository<WordRecognitionRow>,
        pronunciationRecordsService: PronunciationProgressRepository
        wordCounts$: Observable<ds_Dict<DocumentWordCount[]>>,
        cardsRepository: CardsRepository,
        ignoredWordsRepository: IgnoredWordsRepository
    }) {
        this.indexedScheduleRows$ = combineLatest([
            recognitionRecordsService.records$.pipe(startWith({})),
            wordCounts$.pipe(startWith({})),
            pronunciationRecordsService.records$,
            cardsRepository.cardIndex$,
            ignoredWordsRepository.latestRecords$
        ]).pipe(
            map(([wordRecognitionRowIndex, wordCounts, pronunciationRowIndex, cardIndex, ignoredWords]) => {
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
                return Object.fromEntries(Object.entries(scheduleRows).map(([word, scheduleRowData]) => [
                    word,
                    new ScheduleRow(scheduleRowData)
                ]));
            }),
            shareReplay(1)
        );
    }


}