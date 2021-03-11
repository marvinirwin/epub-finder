import {BehaviorSubject, combineLatest, Observable, of, ReplaySubject, Subject} from "rxjs";
import {Dictionary} from "lodash";
import {Segment} from "@shared/";
import {filter, switchMap} from "rxjs/operators";
import {ds_Dict} from "../delta-scan/delta-scan.module";
import {HotkeyModes} from "./hotkey-modes";
import {Hotkeys} from "./hotkeys.interface";
import {observableLastValue, SettingsService} from "../../services/settings.service";
import {ActiveSentenceService} from "../active-sentence.service";
import {setMouseOverText} from "../../components/mouseover-div";
import {LanguageConfigsService} from "../language-configs.service";
import {BrowserSegment} from "../browser-segment";

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


const compareKeySequenceToHotkeyMap = (hotkeyMap: Map<string[], Subject<void>>, keysPressed: ds_Dict<boolean>) => {
    hotkeyMap.forEach((subject, keys) => {
        if (keys.every(key => keysPressed[key])) {
            subject.next()
        }
    })
};

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
    mouseoverSegment$ = new ReplaySubject<BrowserSegment | undefined>(1);

    constructor({hotkeys$, settingsService, activeSentenceService, languageConfigsService}: {
        hotkeys$: Observable<Map<string[], Subject<void>>>,
        settingsService: SettingsService,
        activeSentenceService: ActiveSentenceService,
        languageConfigsService: LanguageConfigsService
    }) {
        this.hotkeys$ = hotkeys$;
        this.activeSentenceService = activeSentenceService;
/*
        settingsService.showTranslation$.subscribe(showTranslations => {
            this.showTranslations = showTranslations;
            if (showTranslations) {
                setMouseOverText(this.latestTranslationTarget?._translation || '')
            } else {
                setMouseOverText('')
            }
        });
*/
        combineLatest([
                hotkeys$,
                this.keysPressed$
            ]
        ).subscribe(([hotkeyMap, keysPressed]) => {
            compareKeySequenceToHotkeyMap(hotkeyMap, keysPressed);
        });

        this.mouseoverSegment$.pipe(
            switchMap(
                segment => segment ? segment.mouseoverText$ : of({title: '', subtitle: ''})
            )
        ).subscribe(({title, subtitle}) => setMouseOverText(title, subtitle));
    }

    async pressHotkey(keys: string[]) {
        const hotkeys = await observableLastValue(this.hotkeys$);
        compareKeySequenceToHotkeyMap(hotkeys, Object.fromEntries(keys.map(key => [key, true])));
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

    public applySegmentListeners(segments: BrowserSegment[]) {
        segments.forEach(segment => {
            const showEvents = ['mouseenter', 'focus'];
            const hideEvents = ['mouseleave', 'blur'];
            const sentenceHTMLElement = segment.getSentenceHTMLElement();
            sentenceHTMLElement.classList.add('applied-sentence-listener');
            if (!sentenceHTMLElement) {
                throw new Error("Cannot find sentenceElement or popperElement")
            }
            sentenceHTMLElement.addEventListener('mouseover', () =>
                this.activeSentenceService.activeSentence$.next(segment)
            )

            const show = () => {
                this.mouseoverSegment$.next(segment);
            }
            const hide = () => {
                this.mouseoverSegment$.next(undefined);
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
