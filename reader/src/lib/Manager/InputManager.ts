import {fromEvent, merge, Subject} from "rxjs";
import { Dictionary } from "lodash";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {getTranslation} from "../Util/Util";

export class InputManager {
    keydownMap: Dictionary<Subject<KeyboardEvent>> = {};
    keyupMap: Dictionary<Subject<KeyboardEvent>> = {};
    selectedText$: Subject<string> = new Subject<string>();
    constructor() {}

    applyListeners(root: HTMLElement) {
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

    public static applySentenceElementSelectListener(annotatedElements: AtomizedSentence) {
        annotatedElements.getSentenceHTMLElement().onmouseenter = async (ev: MouseEvent) => {
            annotatedElements.getTranslation();
        };
    }
}