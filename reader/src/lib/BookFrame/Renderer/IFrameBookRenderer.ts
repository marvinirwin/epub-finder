import {BookRenderer} from "./BookRenderer";
import {switchMap, withLatestFrom} from "rxjs/operators";
import {printExecTime} from "../../Util/Timer";
import {InputManager} from "../../Manager/InputManager";
import {AtomizedSentence} from "../../Atomized/AtomizedSentence";
import {ANNOTATE_AND_TRANSLATE} from "../../Atomized/AtomizedDocument";
import {XMLDocumentNode} from "../../Interfaces/XMLDocumentNode";
import {Frame} from "../Frame";

export class IFrameBookRenderer extends BookRenderer {
    constructor() {
        super();
        this.srcDoc$.pipe(
            withLatestFrom(this.frame$.obs$.pipe(
                switchMap(frame => frame.iframe$)
            )),
            switchMap(async ([srcDoc, frame]) => {
                await Frame.SetIFrameSource(frame.iframe, srcDoc);
                const sentences = printExecTime("Rehydration", () => this.rehydratePage(frame.body.ownerDocument as HTMLDocument));
                InputManager.applyAtomizedSentenceListeners(sentences);
            }),
        )
    }

    rehydratePage(htmlDocument: HTMLDocument): AtomizedSentence[] {
        const elements = htmlDocument.getElementsByClassName(ANNOTATE_AND_TRANSLATE);
        const annotatedElements = new Array(elements.length);
        const text = [];
        for (let i = 0; i < elements.length; i++) {
            const annotatedElement = elements[i];
            let sentenceElement = new AtomizedSentence(annotatedElement as unknown as XMLDocumentNode);
            annotatedElements[i] = sentenceElement;
            text.push(sentenceElement.translatableText);
        }
        return annotatedElements;
    }
}