import {OpenBook} from "../BookFrame/OpenBook";
import {TrieObservable} from "./QuizCharacter";
import {Observable} from "rxjs";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";

export class ReadingBookService {
    public displayBook: OpenBook;

    constructor({ trie$, displayDocument$, }: {trie$: TrieObservable, displayDocument$: Observable<AtomizedDocument> } ) {
        this.displayBook = new OpenBook(
            "Reading Book",
            trie$,
            displayDocument$,
        );
    }

}