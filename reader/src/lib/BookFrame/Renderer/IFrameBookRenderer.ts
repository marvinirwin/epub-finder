import {BookRenderer} from "./BookRenderer";
import {switchMap, tap, withLatestFrom} from "rxjs/operators";
import {printExecTime} from "../../Util/Timer";
import {InputManager} from "../../Manager/InputManager";
import {AtomizedSentence} from "../../Atomized/AtomizedSentence";
import {ANNOTATE_AND_TRANSLATE} from "../../Atomized/AtomizedDocument";
import {XMLDocumentNode} from "../../Interfaces/XMLDocumentNode";
import {Frame} from "../Frame";
import {combineLatest} from "rxjs";

export class IFrameBookRenderer extends BookRenderer {
    constructor() {
        super();
        combineLatest([
            this.srcDoc$,
            this.frame$.obs$.pipe(
                switchMap(frame => {
                    debugger;
                    return frame.iframe$;
                }),
            )
        ]).subscribe(async ([srcDoc, frame]) => {
            debugger;
            await Frame.SetIFrameSource(frame.iframe, srcDoc);
            const sentences = printExecTime("Rehydration", () => this.rehydratePage(frame.body.ownerDocument as HTMLDocument));
            InputManager.applyAtomizedSentenceListeners(sentences);
        });
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