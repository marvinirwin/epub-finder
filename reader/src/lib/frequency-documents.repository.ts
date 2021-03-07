import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {FrequencyDocument} from "./frequency-documents";
import {TrieService} from "./manager/trie.service";
import {ScheduleRowsService} from "./manager/schedule-rows.service";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {SettingsService} from "../services/settings.service";
import {TabulatedFrequencyDocument} from "./learning-tree/tabulated-frequency-document";
import {DocumentRepository} from "./documents/document.repository";

export const tabulateFrequencyDocuments =
    (frequencyDocuments$: Observable<FrequencyDocument[]>):
        Observable<TabulatedFrequencyDocument[]> => {
        return frequencyDocuments$
            .pipe(
                switchMap(all =>
                    combineLatest(all
                        .map(d => {
                                return d.tabulation$
                                    .pipe(
                                        map(tabulation => (
                                            new TabulatedFrequencyDocument(
                                                d.frequencyDocument,
                                                tabulation
                                            )
                                        ))
                                    );
                            }
                        )
                    )
                )
            );
    };

export class FrequencyDocumentsRepository {
    public selected$: Observable<Map<string, FrequencyDocument>>;
    public selectedTabulated$: Observable<TabulatedFrequencyDocument[]>;

    constructor(
        {
            trieService,
            scheduleRowsService,
            settingsService,
            documentRepository
        }: {
            trieService: TrieService,
            scheduleRowsService: ScheduleRowsService,
            settingsService: SettingsService,
            documentRepository: DocumentRepository
        }) {
        this.selected$ = combineLatest([
            documentRepository.collection$,
            settingsService.selectedFrequencyDocuments$
        ]).pipe(
            map(([allDocuments, selectedFrequencyDocumentIds]) => {
                const newMap = new Map<string, FrequencyDocument>();
                selectedFrequencyDocumentIds.forEach(selectedFrequencyDocumentId => {
                    const documentSelectedForFrequency = allDocuments.get(selectedFrequencyDocumentId)
                    if (documentSelectedForFrequency) {
                        const frequencyDocument = new FrequencyDocument(
                            documentSelectedForFrequency,
                            scheduleRowsService.indexedScheduleRows$
                                .pipe(
                                    map(indexedScheduleRows => new Map(Object.entries(indexedScheduleRows))),
                                    shareReplay(1)
                                ),
                            trieService.trie$
                        );
                        newMap.set(
                            frequencyDocument.frequencyDocument.id(),
                            frequencyDocument
                        )
                    }
                })
                return newMap;
            }),
            shareReplay(1)
        )

        this.selectedTabulated$ = tabulateFrequencyDocuments(
            this.selected$.pipe(
                map(frequencyDocumentMap => Array.from(frequencyDocumentMap.values())),
                shareReplay(1)
            )
        )
    }
}

