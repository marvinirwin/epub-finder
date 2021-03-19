import {Observable, ReplaySubject} from "rxjs";
import {setInterval} from "timers";
import {HotkeyModes} from "./hotkeys/hotkey-modes";
import {isDocument} from "./hotkeys/browser-inputs-service";
import {GeneralToastMessageService} from "./general-toast-message.service";
import {DEV} from "../components/directory/app-directory-service";
import {Typography} from "@material-ui/core";
import React from "react";


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
        {
            generalToastMessageService
        }: {
            generalToastMessageService: GeneralToastMessageService;
        }
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
        if (DEV) {
            this.hotkeyMode$.subscribe(mode => generalToastMessageService.addToastMessage$.next(
                () => {
                    return <Typography>
                        Hotkey Mode: {mode}
                    </Typography>
                }
            ))
        }
    }
}