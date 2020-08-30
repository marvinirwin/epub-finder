import {BookRenderer} from "./BookRenderer";
import {flatMap, shareReplay, switchMap} from "rxjs/operators";
import {printExecTime} from "../../Util/Timer";
import {BrowserInputs} from "../../Manager/BrowserInputs";
import {AtomizedSentence} from "../../Atomized/AtomizedSentence";
import {ANNOTATE_AND_TRANSLATE, AtomizedDocument} from "../../Atomized/AtomizedDocument";
import {XMLDocumentNode} from "../../Interfaces/XMLDocumentNode";
import {Frame} from "../Frame";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {appendBookStyle} from "../AppendBookStyle";
import {ds_Dict} from "../../Util/DeltaScanner";
import {DOMParser, XMLSerializer} from "xmldom";
import {waitFor} from "../../Util/waitFor";

export class IFrameBookRenderer implements BookRenderer {
    srcDoc$ = new ReplaySubject<string>(1);
    frame$ = new ReplaySubject<Frame>(1);
    body$ = new ReplaySubject<HTMLBodyElement>(1);
    renderedAtomizedSentences$: Observable<ds_Dict<AtomizedSentence>>;
    constructor(public name: string) {
        this.renderedAtomizedSentences$ = combineLatest([
            this.srcDoc$,
            this.frame$.pipe(
                switchMap(frame => {
                    return frame.iframe$;
                }),
            )
        ]).pipe(
            flatMap(async ([srcDoc, frame]) => {
                return {}
            }, 1),
            shareReplay(1)
        )
    }

    static rehydratePage(htmlDocument: HTMLDocument): ds_Dict<AtomizedSentence> {
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