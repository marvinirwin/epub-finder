import {QuizScheduleRowData, ScheduleRow, ScheduleRowRecord} from "./schedule-row";
import {ScheduleRowsService} from "./schedule-rows-service.interface";
import {TranslationAttemptRecord, TranslationAttemptRepository} from "./translation-attempt.repository";
import {OpenDocumentsService} from "../manager/open-documents.service";
import {combineLatest, Observable} from "rxjs";
import {ds_Dict} from "../delta-scan/delta-scan.module";
import {map} from "rxjs/operators";
import {TranslationAttemptService} from "../../components/translation-attempt/translation-attempt.service";
import {WeightedVocabService} from "../weighted-vocab.service";
import {orderBy} from "lodash";
import {
    wordListAverageDifficulty,
    wordsFromCountRecordList
} from "../../../../server/src/shared/tabulation/word-count-records.module";
import {WordCountRecord} from "../../../../server/src/shared/tabulation/tabulate";
import {isChineseCharacter} from "../../../../server/src/shared/OldAnkiClasses/Card";

export interface TranslationAttemptScheduleData {
    translationAttemptRecords: TranslationAttemptRecord[];
    segmentText: string;
    wordCountRecords: WordCountRecord[]
}

export class TranslationAttemptScheduleService implements ScheduleRowsService<TranslationAttemptScheduleData> {
    indexedScheduleRows$: Observable<ds_Dict<ScheduleRow<TranslationAttemptScheduleData>>>;

    constructor(
        {
            translationAttemptRepository,
            openDocumentsService,
            weightedVocabService
        }: {
            translationAttemptRepository: TranslationAttemptRepository,
            openDocumentsService: OpenDocumentsService,
            weightedVocabService: WeightedVocabService
        }
    ) {
        this.indexedScheduleRows$ = combineLatest([
            openDocumentsService.virtualDocumentTabulation$,
            translationAttemptRepository.records$,
            weightedVocabService.weightedVocab$
        ]).pipe(
            map(([
                     virtualDocumentTabulation,
                     translationAttempts,
                     weightedVocab]) => {
                const scheduleRows: ds_Dict<TranslationAttemptScheduleData> = {};
                const ensureScheduleRow = (segmentText: string) => {
                    if (!scheduleRows[segmentText]) {
                        scheduleRows[segmentText] = {
                            translationAttemptRecords: [],
                            segmentText,
                            wordCountRecords: []
                        } as TranslationAttemptScheduleData;
                    }
                    return scheduleRows[segmentText];
                };
                virtualDocumentTabulation.serializedTabulations
                    .forEach(serialzedTabulation => serialzedTabulation
                        .segmentWordCountRecordsMap
                        .forEach((value, key) => {
                            if (key.text.split('').find(isChineseCharacter)) {
                                ensureScheduleRow(key.text).wordCountRecords.push(...value);
                            }
                            }
                        )
                    );
                Object.entries(translationAttempts)
                    .forEach(([key, value]) => {
                        if (scheduleRows[key]) {
                            scheduleRows[key].translationAttemptRecords.push(...value);
                        }
                    });
                const fromEntries = Object.fromEntries(
                    orderBy(
                        Object.values(scheduleRows)
                            .map(scheduleRowData => [
                                    scheduleRowData.segmentText,
                                    new ScheduleRow(
                                        scheduleRowData,
                                        scheduleRowData.translationAttemptRecords
                                    )
                                ]
                            ),
                        ([segmentText, scheduleRow]: [string, ScheduleRow<TranslationAttemptScheduleData>]) =>
                            wordListAverageDifficulty(
                                wordsFromCountRecordList(scheduleRow.d.wordCountRecords),
                                weightedVocab
                            ),
                        'asc'
                    )
                );
                return fromEntries;
            })
        )
    }
}