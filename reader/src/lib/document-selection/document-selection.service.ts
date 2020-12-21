import {DocumentSelectionRowInterface} from "./document-selection-row.interface";
import {combineLatest, Observable} from "rxjs";
import {SettingsService} from "../../services/settings.service";
import {map, shareReplay} from "rxjs/operators";
import {keyBy, orderBy} from "lodash";
import {AvailableDocumentsService} from "../documents/available-documents.service";

export class DocumentSelectionService {
    documentSelectionRows$: Observable<DocumentSelectionRowInterface[]>;

    constructor({availableDocumentsService, settingsService}: {
        availableDocumentsService: AvailableDocumentsService,
        settingsService: SettingsService
    }) {
        this.documentSelectionRows$ = combineLatest([
            availableDocumentsService.available$,
            settingsService.checkedOutDocuments$,
            settingsService.readingDocument$
        ]).pipe(
            map(([available, checkedOutDocumentNames, readingDocumentName]) => {
                const all: DocumentSelectionRowInterface[] = [
                    ...available
                        .map(({name, belongsToUser, uploadDate, document_id, id}) => ({
                            name,
                            belongsToCurrentUser: !!belongsToUser,
                            lastModified: uploadDate,
                            reading: readingDocumentName === name,
                            document_id: document_id || id,
                            id
                        } as DocumentSelectionRowInterface)),
                ];
                // Get the latest version for each name
                let documentSelectionRowInterfaces = orderBy(
                    Object.values(keyBy(all, 'id')),
                    ['belongsToCurrentUser', 'lastModified'],
                    ['desc', 'desc']
                );
                console.log(documentSelectionRowInterfaces);
                return documentSelectionRowInterfaces
            }),
            shareReplay(1)
        )
    }
}