import {OpenBook} from "../BookFrame/OpenBook";
import {TrieObservable} from "./QuizCharacter";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {ds_Dict} from "../Tree/DeltaScanner";
import {map, shareReplay, startWith, switchMap, tap, withLatestFrom} from "rxjs/operators";

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
                openBooks$: Observable<ds_Dict<OpenBook>>,
                selectedBook$: Observable<string>
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
            const checkedOutBooksList = Object.values(checkedOutBooks);
            if ((!selectedBook || !checkedOutBooks[selectedBook]) && checkedOutBooksList.length) {
                this.displayDocument$.next(checkedOutBooksList[0].atomizedDocument$)
            }
            if (checkedOutBooks[selectedBook]) {
                this.displayDocument$.next(checkedOutBooks[selectedBook].atomizedDocument$);
            }
        })
    }
}