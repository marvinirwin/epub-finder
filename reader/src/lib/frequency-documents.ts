import {combineLatest, from, Observable} from "rxjs";
import {DocumentReadabilityProgress} from "./document-readability-progress";
import {LtDocument, SerializedTabulation} from "@shared/";
import {NormalizedScheduleRowData, ScheduleRow} from "./schedule/schedule-row";
import {TrieObservable} from "./manager/open-documents.service";
import {TabulateRemoteDocument} from "./Workers/worker.helpers";
import {map, shareReplay, switchMap} from "rxjs/operators";

export class FrequencyDocument {
    progress$: Observable<DocumentReadabilityProgress>;
    tabulation$: Observable<SerializedTabulation>;

    constructor(
        public frequencyDocument: LtDocument,
        private scheduleRows$: Observable<Map<string, ScheduleRow<NormalizedScheduleRowData>>>,
        private wordTrie$: TrieObservable
    ) {
        this.tabulation$ = wordTrie$.pipe(
            switchMap(wordTrie => TabulateRemoteDocument(
                {trieWords: Array.from(wordTrie.t.values()), d: frequencyDocument.d}
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