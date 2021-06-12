import { OpenDocumentsService } from './open-documents.service'
import { SettingsService } from '../../services/settings.service'
import {map, shareReplay, switchMap} from 'rxjs/operators'
import { combineLatest, Observable } from 'rxjs'
import { SerializedDocumentTabulation } from '@shared/'
import { pipeLog } from './pipe.log'
import {OpenDocument} from "../document-frame/open-document.entity";

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
        const selectedPipe = <itemWithIdType, idType>(idFunc: (v: itemWithIdType) => idType) => (o$: Observable<[ itemWithIdType[], idType[] ]>): Observable<itemWithIdType[]> => o$.pipe(
            map(([itemsWithIds, selectedIds]) => {
                const set = new Set(selectedIds)
                return itemsWithIds.filter(
                    (tabulation) => set.has(idFunc(tabulation)),
                )
            }),
        )

        function openDocumentList() {
            return openDocumentsService.sourceDocuments$
                .pipe(map(sourceDocumentMap => Array.from(sourceDocumentMap.values())));
        }

        this.selectedFrequencyVirtualTabulations$ = combineLatest([
            openDocumentList()
                .pipe(pipeLog("selected-virtual-tabulations:selected-frequency-virtualTabulations")),
            settingsService.selectedFrequencyDocuments$,
        ]).pipe(
            selectedPipe<OpenDocument, string>(t => t.id),
            switchMap(openDocuments => combineLatest(openDocuments.map(openDocument => openDocument.virtualTabulation$))),
            shareReplay(1),
        );
        this.selectedExampleVirtualTabulations$ = combineLatest([
            openDocumentList()
                .pipe(pipeLog("selected-virtual-tabulations:example-virtual-tabulations")),
            settingsService.selectedExampleSegmentDocuments$,
        ]).pipe(
            selectedPipe<OpenDocument, string>(t => t.id),
            switchMap(openDocuments => combineLatest(openDocuments.map(openDocument => openDocument.virtualTabulation$))),
            shareReplay(1),
        )
    }
}
