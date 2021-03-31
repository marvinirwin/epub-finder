import { combineLatest, Observable, ReplaySubject } from "rxjs";
import { AtomizedDocument } from "@shared/";
import { shareReplay, switchMap, tap } from "rxjs/operators";
import { filterMap, findMap, firstMap } from "../util/map.module";
import { SettingsService } from "../../services/settings.service";
import {
  OpenDocumentsService,
  READING_DOCUMENT_NODE_LABEL,
  TrieObservable,
} from "./open-documents.service";
import { OpenDocument } from "../document-frame/open-document.entity";
import { LanguageConfigsService } from "../language/language-configs.service";
import { TabulationConfigurationService } from "../language/language-maps/tabulation-configuration.service";
import { OnSelectService } from "../user-interface/on-select.service";

export class ReadingDocumentService {
  public readingDocument: OpenDocument;
  private displayDocument$ = new ReplaySubject<Observable<AtomizedDocument>>(1);

  constructor({
    tabulationConfigurationService,
    openDocumentsService,
    settingsService,
    languageConfigsService,
    onSelectService,
  }: {
    tabulationConfigurationService: TabulationConfigurationService;
    openDocumentsService: OpenDocumentsService;
    settingsService: SettingsService;
    languageConfigsService: LanguageConfigsService;
    onSelectService: OnSelectService;
  }) {
    this.readingDocument = new OpenDocument(
      "Reading Document",
      tabulationConfigurationService,
      this.displayDocument$.pipe(
        switchMap((atomizedDocument) => {
          return atomizedDocument;
        }),
        shareReplay(1)
      ),
      "Reading Document",
      {
        settingsService,
        languageConfigsService,
        onSelectService,
      }
    );

    openDocumentsService.openDocumentTree.appendDelta$.next({
      nodeLabel: "root",
      children: {
        [READING_DOCUMENT_NODE_LABEL]: {
          nodeLabel: READING_DOCUMENT_NODE_LABEL,
          children: {
            [this.readingDocument.id]: {
              nodeLabel: this.readingDocument.id,
              value: this.readingDocument,
            },
          },
        },
      },
    });

    combineLatest([
      openDocumentsService.sourceDocuments$,
      settingsService.readingDocument$,
    ]).subscribe(([selectableDocuments, selectedDocument]) => {
      const foundDocument = findMap(
        selectableDocuments,
        (id, document) => document.id === selectedDocument
      );
      if ((!selectedDocument || !foundDocument) && selectableDocuments.size) {
        const firstCheckedOutDocument = firstMap(selectableDocuments);
        // Will this id
        settingsService.readingDocument$.next(firstCheckedOutDocument.id);
        this.displayDocument$.next(firstCheckedOutDocument.atomizedDocument$);
      }
      if (foundDocument) {
        this.displayDocument$.next(foundDocument.atomizedDocument$);
      }
    });
  }
}
