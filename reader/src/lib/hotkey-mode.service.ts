import {Observable, ReplaySubject} from "rxjs";
import {setInterval} from "timers";
import {HotkeyModes} from "./hotkeys/hotkey-modes";
import {isDocument} from "./hotkeys/browser-inputs";


const inputSelected = "inputSelected";
const nothingSelected = "nothingSelected";

export function hotkeyMode(t: HTMLElement | Document | null): HotkeyMode {
    if (!t) return nothingSelected;

    if (isDocument(t)) {
        return nothingSelected;
    }

    switch (t.tagName) {
        case "INPUT":
        case "TEXTAREA":
            return inputSelected;
        default:
            return nothingSelected;
    }
}

export type HotkeyMode = typeof inputSelected | typeof nothingSelected;

export class HotkeyModeService {
    hotkeyMode$ = new ReplaySubject<HotkeyMode>(1);

    constructor(
        {}: {}
    ) {
        window.addEventListener('blur', el => {
            this.hotkeyMode$.next(nothingSelected)
        });
        window.addEventListener('focus', el => {
            switch ((el.target as HTMLElement)?.tagName) {
                case "INPUT":
                case "TEXTINPUT":
                    this.hotkeyMode$.next(inputSelected);
                    break;
                default:
                    this.hotkeyMode$.next(nothingSelected);
            }

        });
    }
}