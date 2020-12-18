import {Observable} from "rxjs";
import {AtomizedSentence} from "../lib/Atomized/AtomizedSentence";
import {ds_Dict} from "../lib/Tree/DeltaScanner";
import {ReadingDocumentService} from "../lib/Manager/reading-document.service";

export class VisibleSentencesService {
    visibleSentences$: Observable<ds_Dict<AtomizedSentence[]>>
    constructor({ readingDocumentService }: {readingDocumentService: ReadingDocumentService}) {
        this.visibleSentences$ = readingDocumentService.readingDocument.renderedSentences$;
    }
}