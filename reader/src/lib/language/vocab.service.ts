import { SerializedTabulation } from '@shared/'
import { combineLatest, Observable } from 'rxjs'
import { SettingsService } from '../../services/settings.service'
import { tabulateFrequencyDocuments } from '../documents/frequency-documents.repository'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { QuizCardScheduleRowsService } from '../schedule/quiz-card-schedule-rows.service'
import { DocumentRepository } from '../documents/document.repository'
import { FrequencyDocument } from '../documents/frequency-documents'
import { TabulationConfigurationService } from './language-maps/tabulation-configuration.service'
import { TimeService } from '../time/time.service'

export class VocabService {
    vocab$: Observable<SerializedTabulation>

    constructor({
        settingsService,
        documentRepository,
        quizCardScheduleRowsService,
        tabulationConfigurationService,
        timeService,
    }: {
        settingsService: SettingsService
        documentRepository: DocumentRepository
        quizCardScheduleRowsService: QuizCardScheduleRowsService
        tabulationConfigurationService: TabulationConfigurationService
        timeService: TimeService
    }) {
        const observable = combineLatest([
            documentRepository.collection$,
            settingsService.selectedVocabulary$,
        ]).pipe(
            map(([documents, vocabularyDocumentId$]) => {
                const selectedDocument = documents.get(vocabularyDocumentId$)
                return selectedDocument
                    ? [
                          new FrequencyDocument(
                              selectedDocument,
                              quizCardScheduleRowsService.scheduleRows$.pipe(
                                  map(
                                      (indexedScheduleRows) =>
                                          new Map(
                                              Object.entries(
                                                  indexedScheduleRows,
                                              ),
                                          ),
                                  ),
                                  shareReplay(1),
                              ),
                              tabulationConfigurationService,
                          ),
                      ]
                    : []
            }),
            shareReplay(1),
        )
        this.vocab$ = combineLatest([
            tabulateFrequencyDocuments(observable),
            quizCardScheduleRowsService.scheduleRows$,
            timeService.quizNow$,
        ]).pipe(
            map(([[selectedTabulation], indexedScheduleRows, now]) => {
                if (!selectedTabulation) {
                    const knownWordEntries: [string, number][] = Object.values(
                        indexedScheduleRows,
                    )
                        .filter(
                            (row) =>
                                row.isSomewhatRecognized({ now }) ||
                                row.isRecognized(),
                        )
                        .map((row) => [row.d.word, 1])
                    return {
                        wordCounts: Object.fromEntries(knownWordEntries),
                        greedyWordCounts: new Map<string, number>(
                            knownWordEntries,
                        ),
                        wordSegmentStringsMap: new Map(),
                        segmentWordCountRecordsMap: new Map(),
                    }
                }
                return selectedTabulation.tabulation
            }),
            shareReplay(1),
        )
    }
}
