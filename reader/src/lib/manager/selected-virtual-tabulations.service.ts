import { OpenDocumentsService } from "./open-documents.service";
import { SettingsService } from "../../services/settings.service";
import { map, shareReplay, startWith, switchMap, tap } from "rxjs/operators";
import { combineLatest, Observable, pipe } from "rxjs";
import { SerializedDocumentTabulation } from "@shared/";
import { pipeLog } from "./pipe.log";
import { OpenDocument } from "../document-frame/open-document.entity";

export class SelectedVirtualTabulationsService {
  selectedFrequencyVirtualTabulations$: Observable<SerializedDocumentTabulation[]>;
  selectedExampleVirtualTabulations$: Observable<SerializedDocumentTabulation[]>;

  constructor({
                openDocumentsService,
                settingsService
              }: {
    openDocumentsService: OpenDocumentsService
    settingsService: SettingsService
  }) {
    const selectedPipe = <itemWithIdType, idType>(idFunc: (v: itemWithIdType) => idType) =>
      (o$: Observable<[itemWithIdType[], idType[]]>): Observable<itemWithIdType[]> => o$.pipe(
        map(([itemsWithIds, selectedIds]) => {
          const set = new Set(selectedIds);
          const selectedItems = itemsWithIds.filter(
            (tabulation) => set.has(idFunc(tabulation))
          );
          if (!selectedItems.length && itemsWithIds.length) {
            return [itemsWithIds[0]];
          }
          return selectedItems;
        })
      );

    function openDocumentList() {
      return openDocumentsService
        .sourceDocuments$
        .pipe(map(sourceDocumentMap => Array.from(sourceDocumentMap.values())));
    }

    this.selectedFrequencyVirtualTabulations$ = combineLatest([
      openDocumentList().pipe(pipeLog("selected-virtual-tabulations:open-document-list")),
      settingsService.selectedFrequencyDocuments$.obs$.pipe(pipeLog("selected-virtual-tabulations:selected-frequency-documents"))
    ]).pipe(
      selectedPipe<OpenDocument, string>(t => t.id),
      switchMap(openDocuments => combineLatest(openDocuments.map(openDocument => openDocument.virtualTabulation$)).pipe(startWith([]))),
      pipeLog("selected-virtual-tabulations:selected-frequency-virtual-tabulations"),
      shareReplay(1)
    );
    this.selectedExampleVirtualTabulations$ = combineLatest([
      openDocumentList().pipe(pipeLog("selected-virtual-tabulations:open-document-list")),
      settingsService.selectedExampleSegmentDocuments$.obs$
    ]).pipe(
      selectedPipe<OpenDocument, string>(t => t.id),
      switchMap(openDocuments => {
        return combineLatest(openDocuments.map(openDocument => openDocument.virtualTabulation$)).pipe(startWith([]));
      }),
      pipeLog("selected-virtual-tabulations:selected-example-virtual-tabulations"),
      shareReplay(1)
    );
  }
}
