import {ScheduleRow} from "./schedule-row";
import {ScheduleRowsService} from "./schedule-rows-service.interface";
import {TranslationAttemptRecord, TranslationAttemptRepository} from "./translation-attempt.repository";
import {OpenDocumentsService} from "../manager/open-documents.service";
import {combineLatest, Observable} from "rxjs";
import {ds_Dict} from "../delta-scan/delta-scan.module";
import {map} from "rxjs/operators";
import {WeightedVocabService} from "../weighted-vocab.service";
import {orderBy} from "lodash";
import {
    averageWordRecognitionScore,
    wordsFromCountRecordList
} from "../../../../server/src/shared/tabulation/word-count-records.module";
import {WordCountRecord} from "../../../../server/src/shared/tabulation/tabulate";
import {isChineseCharacter} from "../../../../server/src/shared/OldAnkiClasses/Card";
import {SelectedVirtualTabulationsService} from "../manager/selected-virtual-tabulations.service";
import {SerializedTabulationAggregate} from "../../../../server/src/shared/tabulation/serialized-tabulation.aggregate";

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
            selectedVirtualTabulationsService,
            weightedVocabService
        }: {
            translationAttemptRepository: TranslationAttemptRepository,
            selectedVirtualTabulationsService: SelectedVirtualTabulationsService,
            weightedVocabService: WeightedVocabService
        }
    ) {
        this.indexedScheduleRows$ = combineLatest([
            selectedVirtualTabulationsService.selectedVirtualTabulations$,
            translationAttemptRepository.indexOfOrderedRecords$,
            weightedVocabService.weightedVocab$
        ]).pipe(
            map(([
                     selectedVirtualTabulations,
                     translationAttempts,
                     weightedVocab]) => {
                const virtualDocumentTabulation = new SerializedTabulationAggregate(selectedVirtualTabulations)
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
                                if (key.text.split('').find(isChineseCharacter) && key.text.length > 5) {
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
                return Object.fromEntries(
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
                            averageWordRecognitionScore(
                                wordsFromCountRecordList(scheduleRow.d.wordCountRecords),
                                weightedVocab
                            ),
                        'desc'
                    )
                );
            })
        )
    }
}