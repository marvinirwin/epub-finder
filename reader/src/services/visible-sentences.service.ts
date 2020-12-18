import {Observable} from "rxjs";
import {AtomizedSentence} from "../lib/Atomized/AtomizedSentence";
import {ds_Dict} from "../lib/Tree/DeltaScanner";
import {ReadingBookService} from "../lib/Manager/reading-document.service";

export class VisibleSentencesService {
    visibleSentences$: Observable<ds_Dict<AtomizedSentence[]>>
    constructor({ readingBookService }: {readingBookService: ReadingBookService}) {
        this.visibleSentences$ = readingBookService.readingBook.renderedSentences$;
    }
}