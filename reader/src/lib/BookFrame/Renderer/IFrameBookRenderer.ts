import {BookRenderer} from "./BookRenderer";
import {shareReplay, switchMap, tap, withLatestFrom} from "rxjs/operators";
import {printExecTime} from "../../Util/Timer";
import {BrowserInputs} from "../../Manager/BrowserInputs";
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
    body$ = new ReplaySubject<HTMLBodyElement>(1);
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
                debugger;
                await Frame.SetIFrameSource(frame, srcDoc);
                let contentDocument = frame.contentDocument as HTMLDocument;
                const sentences = printExecTime("Rehydration", () => this.rehydratePage(contentDocument));
                BrowserInputs.applyAtomizedSentenceListeners(Object.values(sentences));
                this.body$.next(contentDocument.body as HTMLBodyElement);
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