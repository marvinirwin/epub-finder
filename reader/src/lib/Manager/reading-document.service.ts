import {OpenDocument} from "../DocumentFrame/OpenDocument";
import {TrieObservable} from "./QuizCharacter";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {map, shareReplay, startWith, switchMap, tap, withLatestFrom} from "rxjs/operators";
import {filterMap, findMap, firstMap} from "../map.module";
import {SettingsService} from "../../services/settings.service";
import {OpenDocumentsService, READING_BOOK_NODE_LABEL} from "./open-documents.service";

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
                    [READING_BOOK_NODE_LABEL]: {
                        nodeLabel: READING_BOOK_NODE_LABEL,
                        children: {
                            [this.readingDocument.name]: {
                                nodeLabel: this.readingBook.name,
                                value: this.readingBook
                            }
                        }
                    }
                }
            }
        );


        combineLatest(
            [
                openBooksService.allOpenBooks$,
                settingsService.readingBook$
            ]
        ).subscribe(([
                         checkedOutBooks,
                         selectedBook,
                     ]) => {
            const foundBook = findMap(checkedOutBooks, (id, document) => document.name === selectedBook)
            if ((!selectedBook || !foundBook) && checkedOutBooks.size) {
                this.displayDocument$.next(firstMap(checkedOutBooks).atomizedDocument$)
            }
            if (foundBook) {
                this.displayDocument$.next(foundBook.atomizedDocument$);
            }
        })
    }
}