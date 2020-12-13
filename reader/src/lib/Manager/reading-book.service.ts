import {OpenBook} from "../BookFrame/OpenBook";
import {TrieObservable} from "./QuizCharacter";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {ds_Dict} from "../Tree/DeltaScanner";
import {map, shareReplay, startWith, switchMap, tap, withLatestFrom} from "rxjs/operators";
import {filterMap, findMap, firstMap} from "../map.module";

export class ReadingBookService {
    public readingBook: OpenBook;
    private displayDocument$ = new ReplaySubject<Observable<AtomizedDocument>>(1)

    constructor(
        {
            trie$,
            openBooks$,
            selectedBook$
        }:
            {
                trie$: TrieObservable,
                openBooks$: Observable<Map<number, OpenBook>>,
                selectedBook$: Observable<string | undefined>
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
        // TOOD if a book's atomzied document cannot be loaded, then it must removed from checkedOutBooks$

        combineLatest(
            [
                openBooks$,
                selectedBook$,
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