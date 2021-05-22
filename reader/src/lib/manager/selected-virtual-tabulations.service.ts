import { OpenDocumentsService } from './open-documents.service'
import { SettingsService } from '../../services/settings.service'
import { map, shareReplay } from 'rxjs/operators'
import { combineLatest, Observable } from 'rxjs'
import { SerializedDocumentTabulation } from '@shared/'
import { pipeLog } from './pipe.log'

export class SelectedVirtualTabulationsService {
    selectedFrequencyVirtualTabulations$: Observable<SerializedDocumentTabulation[]>
    selectedExampleVirtualTabulations$: Observable<SerializedDocumentTabulation[]>

    constructor({
        openDocumentsService,
        settingsService,
    }: {
        openDocumentsService: OpenDocumentsService
        settingsService: SettingsService
    }) {
        const selectedPipe = <T, U>(idFunc: (v: T) => U) => (o$: Observable<[ T[], U[] ]>): Observable<T[]> => o$.pipe(
            map(([virtualDocumentTabulation, selectedFrequencyDocuments]) => {
                const set = new Set(selectedFrequencyDocuments)
                return virtualDocumentTabulation.filter(
                    (tabulation) => set.has(idFunc(tabulation)),
                )
            }),
        )
        this.selectedFrequencyVirtualTabulations$ = combineLatest([
            openDocumentsService.virtualDocumentTabulation$
                .pipe(map(tabulationAggregate => tabulationAggregate.serializedTabulations))
                .pipe(pipeLog("selected-virtual-tabulations:selected-frequency-virtualTabulations")),
            settingsService.selectedFrequencyDocuments$,
        ]).pipe(
            selectedPipe<SerializedDocumentTabulation, string>(t => t.id),
            shareReplay(1),
        );
        this.selectedExampleVirtualTabulations$ = combineLatest([
            openDocumentsService.virtualDocumentTabulation$
                .pipe(map(tabulationAggregate => tabulationAggregate.serializedTabulations))
                .pipe(pipeLog("selected-virtual-tabulations:example-virtual-tabulations")),
            settingsService.selectedExampleSegmentDocuments$,
        ]).pipe(
            selectedPipe<SerializedDocumentTabulation, string>(t => t.id),
            shareReplay(1),
        )
    }
}
