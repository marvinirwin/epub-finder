import {SerializedTabulation} from "@shared/";
import {combineLatest, Observable} from "rxjs";
import {SettingsService} from "../services/settings.service";
import {FrequencyDocumentsRepository} from "./frequency-documents.repository";
import {map, shareReplay} from "rxjs/operators";
import {ScheduleRowsService} from "./manager/schedule-rows.service";

export class VocabService {
    vocab$: Observable<SerializedTabulation>;

    constructor(
        {
            settingsService,
            frequencyDocumentsRepository,
            scheduleRowsService
        }: {
            settingsService: SettingsService,
            frequencyDocumentsRepository: FrequencyDocumentsRepository,
            scheduleRowsService: ScheduleRowsService
        }
    ) {
        this.vocab$ = combineLatest(
            [
                frequencyDocumentsRepository.allTabulated$,
                settingsService.selectedVocabulary$,
                scheduleRowsService.indexedScheduleRows$
            ]
        ).pipe(
            map(([
                     allTabulated,
                     selectedFrequencyDocumentId,
                     indexedScheduleRows
                 ]) => {
                const selectedTabulation = allTabulated.find(d => d.frequencyDocument.id() === selectedFrequencyDocumentId);
                // shouldUseFrequencyDocuments
                if (!selectedFrequencyDocumentId || !selectedTabulation) {
                    return {
                        wordCounts: Object.fromEntries(
                            Object.values(indexedScheduleRows)
                                .filter(row => row.isSomewhatRecognized() || row.isRecognized())
                                .map(row => [row.d.word, 1])
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