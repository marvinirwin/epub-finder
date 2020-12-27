import {TrieObservable} from "./QuizCharacter";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {shareReplay, switchMap} from "rxjs/operators";
import {filterMap, findMap, firstMap} from "../map.module";
import {SettingsService} from "../../services/settings.service";
import {OpenDocumentsService, READING_DOCUMENT_NODE_LABEL} from "./open-documents.service";
import {OpenDocument} from "../DocumentFrame/open-document.entity";

export class ReadingDocumentService {
    public readingDocument: OpenDocument;
    private displayDocument$ = new ReplaySubject<Observable<AtomizedDocument>>(1)

    constructor(
        {
            trie$,
            openDocumentsService,
            settingsService
        }:
            {
                trie$: TrieObservable,
                openDocumentsService: OpenDocumentsService,
                settingsService: SettingsService
            }
    ) {
        this.readingDocument = new OpenDocument(
            "Reading Document",
            trie$,
            this.displayDocument$.pipe(
                switchMap(atomizedDocument => {
                    return atomizedDocument;
                }),
                shareReplay(1)
            ),
        );

        openDocumentsService.openDocumentTree.appendDelta$.next(
            {
                nodeLabel: 'root',
                children: {
                    [READING_DOCUMENT_NODE_LABEL]: {
                        nodeLabel: READING_DOCUMENT_NODE_LABEL,
                        children: {
                            [this.readingDocument.name]: {
                                nodeLabel: this.readingDocument.name,
                                value: this.readingDocument
                            }
                        }
                    }
                }
            }
        );


        combineLatest(
            [
                openDocumentsService.allReadingDocuments,
                settingsService.readingDocument$
            ]
        ).subscribe(([
                         checkedOutDocuments,
                         selectedDocument,
                     ]) => {
            const foundDocument = findMap(checkedOutDocuments, (id, document) => document.name === selectedDocument)
            if ((!selectedDocument || !foundDocument) && checkedOutDocuments.size) {
                const defaultReading = firstMap(checkedOutDocuments);
                settingsService.readingDocument$.next(defaultReading.name);
                this.displayDocument$.next(defaultReading.atomizedDocument$);
            }
            if (foundDocument) {
                this.displayDocument$.next(foundDocument.atomizedDocument$);
            }
        })
    }
}