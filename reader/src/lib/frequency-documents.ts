import {combineLatest, from, Observable} from "rxjs";
import {DocumentReadabilityProgress} from "./document-readability-progress";
import {LtDocument} from "@shared/";
import {ScheduleRow} from "./schedule/ScheduleRow";
import {NormalizedScheduleRowData} from "./schedule/schedule-row.interface";
import {TrieObservable} from "./manager/open-documents.service";
import {TabulateDocuments} from "./Workers/worker.helpers";
import {map, shareReplay, switchMap} from "rxjs/operators";

export class FrequencyDocument {
    progress$: Observable<DocumentReadabilityProgress>;

    constructor(
        public frequencyDocument: LtDocument,
        private scheduleRows$: Observable<Map<string, ScheduleRow<NormalizedScheduleRowData>>>,
        private wordTrie$: TrieObservable
    ) {
        this.progress$ = combineLatest([
            scheduleRows$,
            wordTrie$.pipe(
                switchMap(wordTrie => TabulateDocuments(
                    {trie: wordTrie, d: frequencyDocument}
                )),
                shareReplay(1)
            ),
        ]).pipe(
            map(([scheduleRows, tabulatedDocument]) => {
                return new DocumentReadabilityProgress({scheduleRows, tabulatedDocument})
            }),
            shareReplay(1)
        )
    }
}