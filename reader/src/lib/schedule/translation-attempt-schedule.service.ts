import { ScheduleRow } from './schedule-row'
import { ScheduleRowsService } from './schedule-rows-service.interface'
import { TranslationAttemptRecord, TranslationAttemptRepository } from './translation-attempt.repository'
import { combineLatest, Observable } from 'rxjs'
import { ds_Dict } from '../delta-scan/delta-scan.module'
import { map } from 'rxjs/operators'
import { WeightedVocabService } from '../language/weighted-vocab.service'
import { orderBy } from 'lodash'
import {
    averageKnownWords,
    wordsFromCountRecordList,
} from "@shared/"
import { PositionedWord } from "@shared/"
import { SelectedVirtualTabulationsService } from '../manager/selected-virtual-tabulations.service'
import { SerializedTabulationAggregate } from "@shared/"
import { LanguageConfigsService } from '../language/language-configs.service'
import { resolvePartialTabulationConfig } from "@shared/"
import { PotentialExcludedDbColumns } from './indexed-rows.repository'

export interface TranslationAttemptScheduleData {
    translationAttemptRecords: PotentialExcludedDbColumns<TranslationAttemptRecord>[]
    segmentText: string
    wordCountRecords: PositionedWord[]
}

export class TranslationAttemptScheduleService
    implements ScheduleRowsService<TranslationAttemptScheduleData> {
    scheduleRows$: Observable<ScheduleRow<TranslationAttemptScheduleData>[]>

    constructor({
                    translationAttemptRepository,
                    selectedVirtualTabulationsService,
                    weightedVocabService,
                    languageConfigsService,
                }: {
        translationAttemptRepository: TranslationAttemptRepository
        selectedVirtualTabulationsService: SelectedVirtualTabulationsService
        weightedVocabService: WeightedVocabService,
        languageConfigsService: LanguageConfigsService
    }) {
        this.scheduleRows$ = combineLatest([
            selectedVirtualTabulationsService.selectedFrequencyVirtualTabulations$,
            translationAttemptRepository.indexOfOrderedRecords$,
            weightedVocabService.weightedVocab$,
            languageConfigsService.readingLanguageCode$,
        ]).pipe(
            map(
                ([
                     selectedVirtualTabulations,
                     translationAttempts,
                     weightedVocab,
                     language_code,
                 ]) => {
                    const virtualDocumentTabulation = new SerializedTabulationAggregate(
                        selectedVirtualTabulations,
                    )
                    const scheduleRows: ds_Dict<TranslationAttemptScheduleData> = {}
                    const ensureScheduleRow = (segmentText: string) => {
                        if (!scheduleRows[segmentText]) {
                            scheduleRows[segmentText] = {
                                translationAttemptRecords: [],
                                segmentText,
                                wordCountRecords: [],
                            } as TranslationAttemptScheduleData
                        }
                        return scheduleRows[segmentText]
                    }
                    const isNotableCharacterRegex = resolvePartialTabulationConfig(language_code || 'en').isNotableCharacterRegex
                    virtualDocumentTabulation.serializedTabulations.forEach(
                        (serialzedTabulation) => {
                            serialzedTabulation.segmentWordCountRecordsMap.forEach(
                                (wordCountRecords, serializedSegment) => {
                                    if (
                                        serializedSegment.text
                                            .split('')
                                            .find(v => isNotableCharacterRegex.test(v)) &&
                                        serializedSegment.text.length > 5
                                    ) {
                                        ensureScheduleRow(
                                            serializedSegment.text,
                                        ).wordCountRecords.push(...wordCountRecords)
                                    }
                                },
                            )
                        },
                    )
                    Object.entries(translationAttempts).forEach(
                        ([key, value]) => {
                            if (scheduleRows[key]) {
                                scheduleRows[
                                    key
                                    ].translationAttemptRecords.push(...value)
                            }
                        },
                    )
                    return orderBy(
                        Object.values(
                            scheduleRows,
                        ).map((scheduleRowData) => new ScheduleRow(
                            scheduleRowData,
                            scheduleRowData.translationAttemptRecords,
                            ),
                        ),
                        (scheduleRow) =>
                            averageKnownWords(
                                wordsFromCountRecordList(
                                    scheduleRow.d.wordCountRecords,
                                ),
                                weightedVocab,
                            ).average || 0,
                        'desc',
                    )
                },
            ),
        )
    }
}
