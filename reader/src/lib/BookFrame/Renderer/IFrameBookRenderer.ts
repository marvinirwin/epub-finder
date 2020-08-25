import {BookRenderer} from "./BookRenderer";
import {shareReplay, switchMap, tap, withLatestFrom} from "rxjs/operators";
import {printExecTime} from "../../Util/Timer";
import {InputManager} from "../../Manager/InputManager";
import {AtomizedSentence} from "../../Atomized/AtomizedSentence";
import {ANNOTATE_AND_TRANSLATE} from "../../Atomized/AtomizedDocument";
import {XMLDocumentNode} from "../../Interfaces/XMLDocumentNode";
import {Frame} from "../Frame";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {appendBookStyle} from "../AppendBookStyle";
import {ds_Dict} from "../../Util/DeltaScanner";

export class IFrameBookRenderer implements BookRenderer {
    srcDoc$ = new ReplaySubject<string>(1);
    frame$ = new ReplaySubject<Frame>(1);
    atomizedSentences$: Observable<ds_Dict<AtomizedSentence>>;
    constructor() {
        this.atomizedSentences$ = combineLatest([
            this.srcDoc$,
            this.frame$.pipe(
                switchMap(frame => {
                    return frame.iframe$;
                }),
            )
        ]).pipe(
            switchMap(async ([srcDoc, frame]) => {
                await Frame.SetIFrameSource(frame, srcDoc);
                const sentences = printExecTime("Rehydration", () => this.rehydratePage(frame.contentDocument as HTMLDocument));
                InputManager.applyAtomizedSentenceListeners(Object.values(sentences));
                appendBookStyle(frame.contentDocument as Document);
                return sentences;
            }),
            shareReplay(1)
        )
    }

    rehydratePage(htmlDocument: HTMLDocument): ds_Dict<AtomizedSentence> {
        const elements = htmlDocument.getElementsByClassName(ANNOTATE_AND_TRANSLATE);
        const annotatedElements: ds_Dict<AtomizedSentence> = {};
        const text = [];
        for (let i = 0; i < elements.length; i++) {
            const annotatedElement = elements[i];
            let sentenceElement = new AtomizedSentence(annotatedElement as unknown as XMLDocumentNode);
            annotatedElements[sentenceElement.translatableText] = sentenceElement;
            text.push(sentenceElement.translatableText);
        }
        return annotatedElements;
    }
}