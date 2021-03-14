import {combineLatest, from, Observable} from "rxjs";
import {DocumentReadabilityProgress} from "./document-readability-progress";
import {LtDocument, SerializedTabulation} from "@shared/";
import {NormalizedQuizCardScheduleRowData, ScheduleRow} from "./schedule/schedule-row";
import {TrieObservable} from "./manager/open-documents.service";
import {TabulateRemoteDocument} from "./Workers/worker.helpers";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {TabulatedFrequencyDocument} from "./learning-tree/tabulated-frequency-document";
import {TabulationConfigurationService} from "./tabulation-configuration.service";

export class FrequencyDocument {
    progress$: Observable<DocumentReadabilityProgress>;
    tabulation$: Observable<SerializedTabulation>;

    constructor(
        public frequencyDocument: LtDocument,
        private scheduleRows$: Observable<Map<string, ScheduleRow<NormalizedQuizCardScheduleRowData>>>,
        private tabulationConfigurationService: TabulationConfigurationService
    ) {
        this.tabulation$ = tabulationConfigurationService.tabulationConfiguration$.pipe(
            switchMap(config => TabulateRemoteDocument(
                {
                    words: [...config.greedyWordSet.values()],
                    d: frequencyDocument.d,
                    notableSubsequences: [...config.notableCharacterSequences.values()]
                }
            )),
            shareReplay(1)
        );
        this.progress$ = combineLatest([
            scheduleRows$,
            this.tabulation$,
        ]).pipe(
            map(([
                     scheduleRows,
                     tabulatedDocument
                 ]) => {
                return new DocumentReadabilityProgress(
                    {
                        scheduleRows,
                        tabulatedDocument
                    }
                )
            }),
            shareReplay(1)
        )
    }
}