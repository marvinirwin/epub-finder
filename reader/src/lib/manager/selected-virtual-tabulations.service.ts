import { OpenDocumentsService } from "./open-documents.service";
import { SettingsService } from "../../services/settings.service";
import { map, shareReplay } from "rxjs/operators";
import { combineLatest, Observable } from "rxjs";
import { SerializedDocumentTabulation } from "@shared/*";

export class SelectedVirtualTabulationsService {
  selectedVirtualTabulations$: Observable<SerializedDocumentTabulation[]>;

  constructor({
    openDocumentsService,
    settingsService,
  }: {
    openDocumentsService: OpenDocumentsService;
    settingsService: SettingsService;
  }) {
    this.selectedVirtualTabulations$ = combineLatest([
      openDocumentsService.virtualDocumentTabulation$,
      settingsService.selectedFrequencyDocuments$,
    ]).pipe(
      map(([virtualDocumentTabulation, selectedFrequencyDocuments]) => {
        const set = new Set(selectedFrequencyDocuments);
        return virtualDocumentTabulation.serializedTabulations.filter(
          (tabulation) => set.has(tabulation.id || "")
        );
      }),
      shareReplay(1)
    );
  }
}
