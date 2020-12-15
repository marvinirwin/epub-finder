import {Observable} from "rxjs";
import {AtomizedSentence} from "../lib/Atomized/AtomizedSentence";
import {OpenBooksService} from "../lib/Manager/open-books.service";
import {map} from "rxjs/operators";
import {flatten} from "lodash";

export class AtomizedSentenceService {
    elementSentenceMap$: Observable<Map<Element, AtomizedSentence>>;

    constructor({openBooksService}: { openBooksService: OpenBooksService }) {
        this.elementSentenceMap$ = openBooksService.renderedAtomizedSentences$
            .pipe(map(renderedAtomizedSentenceDict =>
                new Map(flatten(Object.values(renderedAtomizedSentenceDict)
                    .map(sentences => sentences
                        .map(sentence => [sentence.element as unknown as Element, sentence])
                    )
                ))
            ))
    }
}