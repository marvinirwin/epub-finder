import {BookRenderer} from "./BookRenderer";
import {map, shareReplay} from "rxjs/operators";
import {AtomizedDocument} from "../../Atomized/AtomizedDocument";

export class InMemoryBookRenderer extends BookRenderer {
    constructor() {
        super();
        this.atomizedSentences$.obs$.subscribe(args => {
            console.log();
        })
        this.atomizedSentences$.addObservable$.next(
            this.srcDoc$.pipe(
                map(srcDoc => {
                    const doc = AtomizedDocument.atomizeDocument(srcDoc);
                    // The documentation doesn't say anything about getElementsByClassName
                    // However i Use it in unit tests, and it apparently works?
                    return Object.fromEntries(doc.getAtomizedSentences().map(sentence => [sentence.translatableText, sentence]));
                }),
                shareReplay(1)
            )
        );
    }
}