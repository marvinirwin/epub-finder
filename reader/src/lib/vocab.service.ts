import {SerializedTabulation} from "@shared/";
import {combineLatest, Observable} from "rxjs";
import {SettingsService} from "../services/settings.service";
import {FrequencyDocumentsRepository, tabulateFrequencyDocuments} from "./frequency-documents.repository";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {ScheduleRowsService} from "./manager/schedule-rows.service";
import {DocumentRepository} from "./documents/document.repository";
import {FrequencyDocument} from "./frequency-documents";
import {TrieService} from "./manager/trie.service";

export class VocabService {
    vocab$: Observable<SerializedTabulation>;

    constructor(
        {
            settingsService,
            documentRepository,
            scheduleRowsService,
            trieService
        }: {
            settingsService: SettingsService,
            documentRepository: DocumentRepository,
            scheduleRowsService: ScheduleRowsService,
            trieService: TrieService
        }
    ) {
        const observable = combineLatest([
            documentRepository.collection$,
            settingsService.selectedVocabulary$
        ]).pipe(
            map(([documents, vocabularyDocumentId$]) => {
                const selectedDocument = documents.get(vocabularyDocumentId$);
                return selectedDocument ? [
                    new FrequencyDocument(
                        selectedDocument,
                        scheduleRowsService.indexedScheduleRows$
                            .pipe(
                                map(indexedScheduleRows =>
                                    new Map(Object.entries(indexedScheduleRows))
                                ),
                                shareReplay(1)
                            ),
                        trieService.trie$
                    )
                ] : [];
            }),
            shareReplay(1)
        );
        this.vocab$ = combineLatest(
            [
                tabulateFrequencyDocuments(observable),
                scheduleRowsService.indexedScheduleRows$
            ]
        ).pipe(
            map(([
                     [selectedTabulation],
                     indexedScheduleRows
                 ]) => {
                if (!selectedTabulation) {
                    const knownWordEntries: [string, number][] = Object.values(indexedScheduleRows)
                        .filter(row => row.isSomewhatRecognized() || row.isRecognized())
                        .map(row => [row.d.word, 1]);
                    return {
                        wordCounts: Object.fromEntries(
                            knownWordEntries
                        ),
                        greedyWordCounts: new Map<string, number>(
                            knownWordEntries
                        ),
                        wordSegmentStringsMap: new Map()
                    }
                }
                return selectedTabulation.tabulation
            }),
            shareReplay(1)
        )
    }
}