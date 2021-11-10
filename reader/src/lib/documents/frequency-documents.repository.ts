import {combineLatest, Observable} from 'rxjs'
import {FrequencyDocument} from './frequency-documents'
import {QuizCardScheduleRowsService} from '../schedule/quiz-card-schedule-rows.service'
import {map, shareReplay, switchMap} from 'rxjs/operators'
import {SettingsService} from '../../services/settings.service'
import {TabulatedFrequencyDocument} from '../learning-tree/tabulated-frequency-document'
import {DocumentRepository} from './document.repository'
import {TabulationConfigurationService} from '../language/language-maps/tabulation-configuration.service'
import {LtDocument} from "@shared/*";

export const tabulateFrequencyDocuments = (
    frequencyDocuments$: Observable<FrequencyDocument[]>,
): Observable<TabulatedFrequencyDocument[]> => {
    return frequencyDocuments$.pipe(
        switchMap((all) =>
            combineLatest(
                all.map((d) => {
                    return d.tabulation$.pipe(
                        map(
                            (tabulation) =>
                                new TabulatedFrequencyDocument(
                                    d.frequencyDocument,
                                    tabulation,
                                ),
                        ),
                    )
                }),
            ),
        ),
    )
}

function frequencyDocumentFactory(
    {
        documentSelectedForFrequency,
        quizCardScheduleRowsService,
        tabulationConfigurationService
    }: {
        documentSelectedForFrequency: LtDocument,
        quizCardScheduleRowsService: QuizCardScheduleRowsService,
        tabulationConfigurationService: TabulationConfigurationService
    }) {
    return new FrequencyDocument(
        documentSelectedForFrequency,
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
    );
}

const getDefaultFrequencyDocumentMap = ({firstDocument, quizCardScheduleRowsService, tabulationConfigurationService}:{firstDocument: LtDocument, quizCardScheduleRowsService: QuizCardScheduleRowsService, tabulationConfigurationService: TabulationConfigurationService}) => {
    const frequencyDocument = frequencyDocumentFactory({
        documentSelectedForFrequency: firstDocument,
        quizCardScheduleRowsService,
        tabulationConfigurationService
    })
    return new Map<string, FrequencyDocument>().set(frequencyDocument.frequencyDocument.id(), frequencyDocument)
};

export class FrequencyDocumentsRepository {
    public selected$: Observable<Map<string, FrequencyDocument>>
    public selectedTabulated$: Observable<TabulatedFrequencyDocument[]>

    constructor({
                    quizCardScheduleRowsService,
                    settingsService,
                    documentRepository,
                    tabulationConfigurationService,
                }: {
        quizCardScheduleRowsService: QuizCardScheduleRowsService
        settingsService: SettingsService
        documentRepository: DocumentRepository
        tabulationConfigurationService: TabulationConfigurationService
    }) {
        this.selected$ = combineLatest([
            documentRepository.collection$,
            settingsService.selectedFrequencyDocuments$,
        ]).pipe(
            map(([allDocumentsMap, selectedFrequencyDocumentIds]) => {
                const shouldSelectDefaultFrequencyDocument = !selectedFrequencyDocumentIds.length;
                if (shouldSelectDefaultFrequencyDocument) {
                    const [firstDocument] = Array.from(allDocumentsMap.values());
                    if (firstDocument) {
                        return getDefaultFrequencyDocumentMap({firstDocument, quizCardScheduleRowsService, tabulationConfigurationService});
                    }
                }
                const newMap = new Map<string, FrequencyDocument>()
                selectedFrequencyDocumentIds.forEach(
                    (selectedFrequencyDocumentId) => {
                        const documentSelectedForFrequency = allDocumentsMap.get(
                            selectedFrequencyDocumentId,
                        )
                        if (documentSelectedForFrequency) {
                            const frequencyDocument = frequencyDocumentFactory({
                                documentSelectedForFrequency,
                                quizCardScheduleRowsService,
                                tabulationConfigurationService
                            })
                            newMap.set(
                                frequencyDocument.frequencyDocument.id(),
                                frequencyDocument,
                            )
                        }
                    },
                )
                return newMap
            }),
            shareReplay(1),
        )

        this.selectedTabulated$ = tabulateFrequencyDocuments(
            this.selected$.pipe(
                map((frequencyDocumentMap) =>
                    Array.from(frequencyDocumentMap.values()),
                ),
                shareReplay(1),
            ),
        )
    }
}
