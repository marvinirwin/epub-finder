import {combineLatest, Observable} from "rxjs";
import {map, shareReplay, startWith} from "rxjs/operators";
import {ds_Dict} from "../Tree/DeltaScanner";
import {ScheduleRow} from "../schedule/schedule-row.interface";
import {ProgressRowService} from "../schedule/progress-row.service";
import {WordRecognitionRow} from "../schedule/word-recognition-row";
import {PronunciationProgressService} from "../schedule/pronunciation-progress.service";
import {DocumentWordCount} from "../Interfaces/DocumentWordCount";

export class ScheduleRowsService {
    public indexedScheduleRows$: Observable<ds_Dict<ScheduleRow>>;
    constructor({
                    recognitionRecordsService,
                    wordCounts$,
                    pronunciationRecordsService
                }: {
        recognitionRecordsService: ProgressRowService<WordRecognitionRow>,
        pronunciationRecordsService: PronunciationProgressService
        wordCounts$: Observable<ds_Dict<DocumentWordCount[]>>,
    }) {
        this.indexedScheduleRows$ = combineLatest([
            recognitionRecordsService.records$.pipe(startWith({})),
            wordCounts$.pipe(startWith({})),
            pronunciationRecordsService.records$
        ]).pipe(
            map(([wordRecognition, wordCounts, pronunciationRecords]) => {
                const scheduleRows: ds_Dict<ScheduleRow> = {};

                function ensureScheduleRow(word: string) {
                    if (!scheduleRows[word]) {
                        scheduleRows[word] = {
                            wordRecognitionRecords: [],
                            wordCountRecords: [],
                            word,
                            pronunciationRecords: [],
                        };
                    }
                    return scheduleRows[word];
                }

                Object.entries(wordCounts).forEach(([word, wordCountRecords]) => {
                    ensureScheduleRow(word).wordCountRecords.push(...wordCountRecords);
                });
                Object.entries(pronunciationRecords).forEach(([word, pronunciationRecords]) => {
                    ensureScheduleRow(word).pronunciationRecords.push(...pronunciationRecords);
                });
                Object.entries(wordRecognition).forEach(([word, wordRecognitionRecords]) => {
                    scheduleRows[word]?.wordRecognitionRecords.push(...wordRecognitionRecords);
                });
                return scheduleRows;
            }),
            shareReplay(1)
        );
    }


}