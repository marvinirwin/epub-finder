import {OpenBook} from "../BookFrame/OpenBook";
import {TrieObservable} from "./QuizCharacter";
import {Observable} from "rxjs";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";

export class ReadingBookService {
    public readingBook: OpenBook;

    constructor({ trie$, displayDocument$, }: {trie$: TrieObservable, displayDocument$: Observable<AtomizedDocument> } ) {
        this.readingBook = new OpenBook(
            "Reading Book",
            trie$,
            displayDocument$,
        );
    }

}