import {DocumentSelectionRowInterface} from "./document-selection-row.interface";
import {combineLatest, Observable} from "rxjs";
import {SettingsService} from "../../services/settings.service";
import {map, shareReplay} from "rxjs/operators";
import {keyBy, orderBy} from "lodash";
import {DocumentRepository} from "../documents/document.repository";

export class DocumentSelectionService {
    documentSelectionRows$: Observable<DocumentSelectionRowInterface[]>;

    constructor({documentRepository, settingsService}: {
        documentRepository: DocumentRepository,
        settingsService: SettingsService
    }) {
        this.documentSelectionRows$ = combineLatest([
            documentRepository.collection$,
            settingsService.checkedOutDocuments$,
            settingsService.readingDocument$
        ]).pipe(
            map(([available, checkedOutDocumentNames, readingDocumentId]) => {
                const all: DocumentSelectionRowInterface[] = [
                    ...[...available.values()]
                        .map((d) => ({
                            name: d.name,
                            belongsToCurrentUser: !d.global, // HACK this is a proxy for belongsToUser
                            lastModified: d.createdAt,
                            reading: readingDocumentId === d.id(),
                            id: d.id(),
                        } as DocumentSelectionRowInterface)),
                ];
                // Get the latest version for each name
                return orderBy(
                    Object.values(keyBy(all, 'id')),
                    ['belongsToCurrentUser', 'lastModified'],
                    ['asc', 'desc']
                )
            }),
            shareReplay(1)
        )
    }
}