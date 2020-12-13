import {BehaviorSubject, combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {Dictionary} from "lodash";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {createPopper} from "@popperjs/core";
import {filter} from "rxjs/operators";
import {ds_Dict} from "../Tree/DeltaScanner";
import {HotkeyModes} from "./HotkeyModes";
import {Hotkeys} from "./hotkeys.interface";


export function isDocument(t: HTMLElement | Document): t is Document {
    return !t.hasOwnProperty('tagName');
}

export function hotkeyMode(t: HTMLElement | Document | null): HotkeyModes {
    if (!t) return HotkeyModes.Reading;

    if (isDocument(t)) {
        return HotkeyModes.Reading;
    }

    switch (t.tagName) {
        case "INPUT":
        case "TEXTAREA":
            return HotkeyModes.TextInput;
        default:
            return HotkeyModes.Reading;
    }
}


export function isListening(keyMode: HotkeyModes, actionListeningFor: keyof Hotkeys<any>) {
    switch (keyMode) {
        case HotkeyModes.TextInput:
            return actionListeningFor === "HIDE";
        case HotkeyModes.Reading:
            return true;
    }
}


/**
 * If the key you're listening for is
 */

export class BrowserInputs {
    keydownMap: Dictionary<Subject<KeyboardEvent>> = {};
    keyupMap: Dictionary<Subject<KeyboardEvent>> = {};
    keysPressed$ = new BehaviorSubject<ds_Dict<boolean>>({});
    selectedText$: Subject<string> = new Subject<string>();
    videoCharacterIndex$ = new ReplaySubject<number | undefined>(1);
    focusedElement$ = new ReplaySubject<HTMLElement | Document | null>(1);

    constructor({hotkeys$}: {
        hotkeys$: Observable<Map<string[], Subject<void>>>,
    }) {
        combineLatest([
                hotkeys$,
                this.keysPressed$
            ]
        ).subscribe(([hotkeyMap, keysPressed]) => {
            hotkeyMap.forEach((subject, keys) => {
                if (keys.every(key => keysPressed[key])) {
                    subject.next()
                }
            })
        })
    }


    applyDocumentListeners(root: HTMLDocument) {
        root.onkeydown = (ev) => {
            this.keysPressed$.next({...this.keysPressed$.getValue(), [ev.key]: true})
            this.keydownMap[ev.key]?.next(ev);
        };
        root.onkeyup = (ev) => {
            this.keysPressed$.next({...this.keysPressed$.getValue(), [ev.key]: false})
            this.keyupMap[ev.key]?.next(ev);
        };

        const checkForSelectedText = () => {
            const activeEl = root.activeElement;
            if (activeEl) {
                // @ts-ignore
                const selObj = root.getSelection();
                if (selObj) {
                    const text = selObj.toString();
                    if (text) {
                        this.selectedText$.next(text);
                    }
                    return;
                }
            }
        };
        root.onmouseup = checkForSelectedText;
        this.getKeyUpSubject("Shift").subscribe(checkForSelectedText);
    }

    getKeyDownSubject(key: string): Subject<KeyboardEvent> {
        if (!this.keydownMap[key]) this.keydownMap[key] = new Subject<KeyboardEvent>()
        return this.keydownMap[key];
    }

    getKeyUpSubject(key: string) {
        if (!this.keyupMap[key]) this.keyupMap[key] = new Subject<KeyboardEvent>()
        return this.keyupMap[key];
    }


    public applyAtomizedSentenceListeners(atomizedSentences: AtomizedSentence[]) {
        atomizedSentences.forEach(atomizedSentence => {
            atomizedSentence.getSentenceHTMLElement().onmouseenter = async (ev: MouseEvent) => {
                atomizedSentence.getTranslation();
            };
            const showEvents = ['mouseenter', 'focus'];
            const hideEvents = ['mouseleave', 'blur'];
            const sentenceHTMLElement = atomizedSentence.getSentenceHTMLElement();
            sentenceHTMLElement.classList.add('applied-sentence-listener');
            const popperHTMLElement = atomizedSentence.getPopperHTMLElement();
            if (!sentenceHTMLElement || !popperHTMLElement) {
                throw new Error("Cannot find sentenceElement or popperElement")
            }
            try {
                createPopper(sentenceHTMLElement, popperHTMLElement, {
                    placement: 'bottom-start',
                    strategy: 'fixed'
                });
            } catch (e) {
                console.error(e);
            }

            const show = () => {
                popperHTMLElement.setAttribute('data-show', '');
            }
            const hide = () => {
                popperHTMLElement.removeAttribute('data-show');
            }

            showEvents.forEach(event => {
                sentenceHTMLElement.addEventListener(event, show);
            });

            hideEvents.forEach(event => {
                sentenceHTMLElement.addEventListener(event, hide);
            });
        })
    }
}

export const filterTextInputEvents = filter((ev: KeyboardEvent) => {
    const tagName = (ev.target as HTMLElement).tagName;
    return !(tagName === 'INPUT' || tagName === "TEXTAREA")
});
