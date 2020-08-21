import {BookFrameRenderer} from "./BookFrameRenderer";
import {map} from "rxjs/operators";
import {AtomizedDocument} from "../../Atomized/AtomizedDocument";

export class BookFrameRendererInMemory extends BookFrameRenderer {
    constructor() {
        super();
        this.srcDoc$.pipe(
            map(srcDoc => {
                const doc = AtomizedDocument.atomizeDocument(srcDoc);
                // The documentation doesn't say anything about getElementsByClassName
                // However i Use it in unit tests, and it apparently works?
                const atomizedSentenceElements = doc.getAtomizedSentences();
                return doc.getAtomizedSentences();
            })
        )
    }
}