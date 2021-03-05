import {BehaviorSubject, combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {Dictionary} from "lodash";
import {Segment} from "../../../../server/src/shared/tabulate-documents/segment";
import {filter} from "rxjs/operators";
import {ds_Dict} from "../delta-scan/delta-scan.module";
import {HotkeyModes} from "./hotkey-modes";
import {Hotkeys} from "./hotkeys.interface";
import {observableLastValue, SettingsService} from "../../services/settings.service";
import {popperGenerator} from "@popperjs/core";
import popperOffsets from '@popperjs/core/lib/modifiers/popperOffsets';
import computeStyles from '@popperjs/core/lib/modifiers/computeStyles';
import applyStyles from '@popperjs/core/lib/modifiers/applyStyles';
import eventListeners from '@popperjs/core/lib/modifiers/eventListeners';
import {ActiveSentenceService} from "../active-sentence.service";

const createPopper = popperGenerator({
    defaultModifiers: [
        popperOffsets,
        computeStyles,
        applyStyles,
        eventListeners,
        {
            ...eventListeners,
            options: {
                resize: false,
                scroll: false
            }
        }
    ]
})


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


function compareKeySequenceToHotkeyMap(hotkeyMap: Map<string[], Subject<void>>, keysPressed: ds_Dict<boolean>) {
    hotkeyMap.forEach((subject, keys) => {
        if (keys.every(key => keysPressed[key])) {
            subject.next()
        }
    })
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

    showTranslations: boolean = false;
    latestTranslationTarget: Segment | undefined;
    private activeSentenceService: ActiveSentenceService;
    private hotkeys$: Observable<Map<string[], Subject<void>>>;

    constructor({hotkeys$, settings$, activeSentenceService}: {
        hotkeys$: Observable<Map<string[], Subject<void>>>,
        settings$: SettingsService,
        activeSentenceService: ActiveSentenceService,
    }) {
        this.hotkeys$ = hotkeys$;
        this.activeSentenceService = activeSentenceService;
        settings$.showTranslation$.subscribe(showTranslations => {
            this.showTranslations = showTranslations;
            if (showTranslations) {
                this.latestTranslationTarget?.showPopper();
            } else {
                this.latestTranslationTarget?.hidePopper();
            }
        });
        combineLatest([
                hotkeys$,
                this.keysPressed$
            ]
        ).subscribe(([hotkeyMap, keysPressed]) => {
            compareKeySequenceToHotkeyMap(hotkeyMap, keysPressed);
        })
    }

    async pressHotkey(keys: string[]) {
        const hotkeys = await observableLastValue(this.hotkeys$);
        compareKeySequenceToHotkeyMap(hotkeys, keys);
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
                        /*
                                                this.selectedText$.next(text);
                        */
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

    public applySegmentListeners(atomizedSentences: Segment[]) {
        atomizedSentences.forEach(atomizedSentence => {
            const showEvents = ['mouseenter', 'focus'];
            const hideEvents = ['mouseleave', 'blur'];
            const sentenceHTMLElement = atomizedSentence.getSentenceHTMLElement();
            sentenceHTMLElement.classList.add('applied-sentence-listener');
            const popperHTMLElement = atomizedSentence.getPopperHTMLElement();
            if (!sentenceHTMLElement || !popperHTMLElement) {
                throw new Error("Cannot find sentenceElement or popperElement")
            }
            sentenceHTMLElement.addEventListener('mouseover', () =>
                this.activeSentenceService.activeSentence$.next(atomizedSentence)
            )

            const show = () => {

                try {
                    atomizedSentence._popperInstance = createPopper(sentenceHTMLElement, popperHTMLElement, {
                        placement: 'bottom-start',
                        strategy: 'fixed',
                    });
                    this.latestTranslationTarget = atomizedSentence;
                    atomizedSentence.showPopper();
                } catch (e) {
                    console.error(e);
                }
            }
            const hide = () => {
                this.latestTranslationTarget = undefined;
                atomizedSentence.hidePopper();
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
