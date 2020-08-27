import {fromEvent, merge, Subject} from "rxjs";
import { Dictionary } from "lodash";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {getTranslation} from "../Util/Util";
import {createPopper} from "@popperjs/core";

export class BrowserInputs {
    keydownMap: Dictionary<Subject<KeyboardEvent>> = {};
    keyupMap: Dictionary<Subject<KeyboardEvent>> = {};
    selectedText$: Subject<string> = new Subject<string>();
    constructor() {}

    applyBodyListeners(root: HTMLElement) {
        root.onkeydown = (ev) => this.keydownMap[ev.key]?.next(ev);
        root.onkeyup = (ev) => this.keyupMap[ev.key]?.next(ev);

        const checkForSelectedText = () => {
            const activeEl = root.ownerDocument?.activeElement;
            if (activeEl) {
                const selObj = root.ownerDocument?.getSelection();
                if (selObj) {
                    const text = selObj.toString();
                    if (text) {
                        this.selectedText$.next(text);
                    }
                    return;
                }
            }
        };
        root.onmouseup = checkForSelectedText
        this.getKeyUpSubject("Shift").subscribe(checkForSelectedText)
    }
    getKeyDownSubject(key: string): Subject<KeyboardEvent> {
        if (!this.keydownMap[key]) this.keydownMap[key] = new Subject<KeyboardEvent>()
        return this.keydownMap[key];
    }
    getKeyUpSubject(key: string) {
        if (!this.keyupMap[key]) this.keyupMap[key] = new Subject<KeyboardEvent>()
        return this.keyupMap[key];
    }


    public static applyAtomizedSentenceListeners(atomizedSentences: AtomizedSentence[]) {
        atomizedSentences.forEach(atomizedSentence => {
            atomizedSentence.getSentenceHTMLElement().onmouseenter = async (ev: MouseEvent) => {
                atomizedSentence.getTranslation();
            };
            const showEvents = ['mouseenter', 'focus'];
            const hideEvents = ['mouseleave', 'blur'];
            let sentenceHTMLElement = atomizedSentence.getSentenceHTMLElement();
            let popperHTMLElement = atomizedSentence.getPopperHTMLElement();
            if (!sentenceHTMLElement || !popperHTMLElement) {
                debugger;
                console.log();
            }
            try {
                createPopper(sentenceHTMLElement, popperHTMLElement, {
                    placement: 'top-start',
                    strategy: 'fixed'
                });
            } catch (e) {
                console.error(e);
            }

            const show = () => {
                popperHTMLElement.setAttribute('data-show', '');
            }
            const hide = () => {
                (popperHTMLElement as unknown as HTMLElement).removeAttribute('data-show');
            }

            showEvents.forEach(event => {
                sentenceHTMLElement.addEventListener(event, show);
            });

            hideEvents.forEach(event => {
                sentenceHTMLElement.addEventListener(event, hide);
            });
        });
    }
}