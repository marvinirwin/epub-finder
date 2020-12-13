import {OpenBook} from "../BookFrame/OpenBook";
import {TrieObservable} from "./QuizCharacter";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {map, shareReplay, startWith, switchMap, tap, withLatestFrom} from "rxjs/operators";
import {filterMap, findMap, firstMap} from "../map.module";
import {SettingsService} from "../../services/settings.service";
import {OpenBooksService, READING_BOOK_NODE_LABEL} from "./open-books.service";

export class ReadingBookService {
    public readingBook: OpenBook;
    private displayDocument$ = new ReplaySubject<Observable<AtomizedDocument>>(1)

    constructor(
        {
            trie$,
            openBooksService,
            settingsService
        }:
            {
                trie$: TrieObservable,
                openBooksService: OpenBooksService,
                settingsService: SettingsService
            }
    ) {
        this.readingBook = new OpenBook(
            "Reading Book",
            trie$,
            this.displayDocument$.pipe(
                switchMap(atomizedDocument => {
                    return atomizedDocument;
                }),
                shareReplay(1)
            ),
        );

        openBooksService.openBookTree.appendDelta$.next(
            {
                nodeLabel: 'root',
                children: {
                    [READING_BOOK_NODE_LABEL]: {
                        nodeLabel: READING_BOOK_NODE_LABEL,
                        children: {
                            [this.readingBook.name]: {
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
            const foundBook = findMap(checkedOutBooks, (id, book) => book.name === selectedBook)
            if ((!selectedBook || !foundBook) && checkedOutBooks.size) {
                this.displayDocument$.next(firstMap(checkedOutBooks).atomizedDocument$)
            }
            if (foundBook) {
                this.displayDocument$.next(foundBook.atomizedDocument$);
            }
        })
    }
}