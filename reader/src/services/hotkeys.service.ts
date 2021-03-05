import {map, shareReplay} from "rxjs/operators";
import {HotKeyEvents} from "../lib/HotKeyEvents";
import {Observable, Subject} from "rxjs";
import {SettingsService} from "./settings.service";
import {Hotkeys} from "../lib/hotkeys/hotkeys.interface";

export class HotkeysService {
    public hotkeyConfiguration$: Observable<Hotkeys<string[]>>;
    private settingsService: SettingsService;

    constructor({settingsService}: { settingsService: SettingsService }) {
        this.hotkeyConfiguration$ = settingsService.hotkeys$
            .pipe(map(hotkeys => ({...HotKeyEvents.defaultHotkeys(), ...hotkeys})));
        this.settingsService = settingsService;
    }

    public mapHotkeysWithDefault(
        defaultHotkeys: Hotkeys<string[]>,
        hotkeyActions: Hotkeys<Subject<void>>
    ): Observable<Map<string[], Subject<void>>> {
        return this.settingsService.hotkeys$.pipe(
            map((hotkeyConfig) => {
                const keyMap = new Map<string[], Subject<void>>();
                let action: keyof Hotkeys<any>;
                // @ts-ignore
                const allActions: (keyof Hotkeys<any>)[] = Object.keys(hotkeyActions);
                const unsetActions = new Set<keyof Hotkeys<any>>(allActions);
                for (action in hotkeyConfig) {
                    if (!hotkeyActions[action]) {
                        console.warn(`Unknown hotkey action ${action}`)
                    }
                    unsetActions.delete(action);
                    keyMap.set(hotkeyConfig[action] || [], hotkeyActions[action])
                }
                unsetActions.forEach(unsetAction => {
                    keyMap.set(defaultHotkeys[unsetAction], hotkeyActions[unsetAction])
                })
                return keyMap;
            }),
            shareReplay(1)
        )
    }
    public static test() {

    }
}