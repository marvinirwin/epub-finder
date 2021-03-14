import {QuizScheduleRowData, ScheduleRow, ScheduleRowRecord} from "./schedule-row";
import {ScheduleRowsService} from "./schedule-rows-service.interface";
import {TranslationAttemptRecord, TranslationAttemptRepository} from "./translation-attempt.repository";
import {OpenDocumentsService} from "../manager/open-documents.service";
import {combineLatest, Observable} from "rxjs";
import {ds_Dict} from "../delta-scan/delta-scan.module";
import {map} from "rxjs/operators";

export interface TranslationAttemptScheduleData {
    translationAttemptRecords: TranslationAttemptRecord[];
    segmentText: string;
}

export class TranslationAttemptScheduleService implements ScheduleRowsService<TranslationAttemptScheduleData> {
    indexedScheduleRows$: Observable<ds_Dict<ScheduleRow<TranslationAttemptScheduleData>>>;

    constructor(
        {
            translationAttemptRepository,
            openDocumentsService
        }: {
            translationAttemptRepository: TranslationAttemptRepository,
            openDocumentsService: OpenDocumentsService
        }
    ) {
        this.indexedScheduleRows$ = combineLatest([
            openDocumentsService.virtualDocumentTabulation$,
            translationAttemptRepository.records$
        ]).pipe(
            map(([virtualDocumentTabulation, translationAttempts]) => {
                const scheduleRows: ds_Dict<TranslationAttemptScheduleData> = {};
                const ensureScheduleRow = (segmentText: string) => {
                    if (!scheduleRows[segmentText]) {
                        scheduleRows[segmentText] = {
                            translationAttemptRecords: [],
                            segmentText,
                        } as TranslationAttemptScheduleData;
                    }
                    return scheduleRows[segmentText];
                };
                virtualDocumentTabulation.serializedTabulations
                    .forEach(serialzedTabulation => serialzedTabulation
                        .segmentWordCountRecordsMap
                        .forEach((value, key) =>
                            ensureScheduleRow(key.text)
                        )
                    );
                Object.entries(translationAttempts)
                    .forEach(([key, value]) => ensureScheduleRow(key)
                        .translationAttemptRecords.push(...value))
                return Object.fromEntries(
                    Object.values(scheduleRows).map(scheduleRowData => [
                            scheduleRowData.segmentText,
                            new ScheduleRow(
                                scheduleRowData,
                                scheduleRowData.translationAttemptRecords
                            )
                        ]
                    )
                );
            })
        )
    }
}