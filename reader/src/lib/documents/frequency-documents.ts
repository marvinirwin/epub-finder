import { combineLatest, from, Observable } from 'rxjs'
import { DocumentReadabilityProgress } from './document-readability-progress'
import { LtDocument, SerializedTabulation } from '@shared/'
import {
    SortQuizData,
    ScheduleRow,
} from '../schedule/schedule-row'
import { TabulateRemoteDocument } from '../workers/worker.helpers'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { TabulationConfigurationService } from '../language/language-maps/tabulation-configuration.service'

export class FrequencyDocument {
    progress$: Observable<DocumentReadabilityProgress>
    tabulation$: Observable<SerializedTabulation>

    constructor(
        public frequencyDocument: LtDocument,
        private scheduleRows$: Observable<
            Map<string, ScheduleRow<SortQuizData>>
        >,
        private tabulationConfigurationService: TabulationConfigurationService,
    ) {
        this.tabulation$ = tabulationConfigurationService.tabulationConfiguration$.pipe(
            switchMap((config) =>
                TabulateRemoteDocument({
                    words: [...config.greedyWordSet.values()],
                    d: frequencyDocument.d,
                    notableSubsequences: [
                        ...config.notableCharacterSequences.values(),
                    ],
                    language_code: config.language_code,
                }),
            ),
            shareReplay(1),
        )
        this.progress$ = combineLatest([scheduleRows$, this.tabulation$]).pipe(
            map(([scheduleRows, tabulatedDocument]) => {
                return new DocumentReadabilityProgress({
                    scheduleRows,
                    tabulatedDocument,
                })
            }),
            shareReplay(1),
        )
    }
}
