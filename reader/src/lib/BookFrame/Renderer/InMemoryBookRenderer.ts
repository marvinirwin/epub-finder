import {BookRenderer} from "./BookRenderer";
import {map, shareReplay} from "rxjs/operators";
import {AtomizedDocument} from "../../Atomized/AtomizedDocument";
import {Observable, ReplaySubject} from "rxjs";
import {Frame} from "../Frame";
import {ds_Dict} from "../../Util/DeltaScanner";
import {AtomizedSentence} from "../../Atomized/AtomizedSentence";

export class InMemoryBookRenderer implements BookRenderer {
    srcDoc$ = new ReplaySubject<string>(1);
    frame$ = new ReplaySubject<Frame>(1);
    body$ = new ReplaySubject<HTMLBodyElement>(1);
    renderedAtomizedSentences$: Observable<ds_Dict<AtomizedSentence>>;
    constructor() {
        this.renderedAtomizedSentences$ = this.srcDoc$
            .pipe(
                map(srcDoc => {
                    const doc = AtomizedDocument.atomizeDocument(srcDoc);
                    // The documentation doesn't say anything about getElementsByClassName
                    // However i Use it in unit tests, and it apparently works?
                    return Object.fromEntries(doc.getAtomizedSentences().map(sentence => [sentence.translatableText, sentence]));
                }),
                shareReplay(1)
            )
    }
}