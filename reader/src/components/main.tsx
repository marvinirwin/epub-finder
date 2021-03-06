import React, {useEffect} from "react";
import {Manager} from "../lib/Manager";
import {useObservableState} from "observable-hooks";
import {HotKeyEvents} from "../lib/HotKeyEvents";
import {AppDirectoryService} from "./directory/app-directory-service";
import {Subject} from "rxjs";
import {Hotkeys} from "../lib/hotkeys/hotkeys.interface";
import {MiniDrawer} from "./containers/drawer";
import {ImageSearchComponent} from "./image-search/image-search.component";
import './mouseover-div';


export const FocusedElement = React.createContext<HTMLElement | Document | null>(null)
export const HotkeyContext = React.createContext<Partial<Hotkeys<string[]>>>({})
const audioRecorderResized$ = new Subject<void>();
const pronunciationVideoResized$ = new Subject<void>();
export const AudioRecorderResizedContext = React.createContext<Subject<void>>(audioRecorderResized$)
export const PronunciationVideoResizedContext = React.createContext<Subject<void>>(pronunciationVideoResized$)


export function Main({m}: { m: Manager }) {
    useEffect(() => {
        m.browserInputs.applyDocumentListeners(document);
        AppDirectoryService(m).subscribe(v => m.treeMenuService.tree.appendDelta$.next(v));
    }, [m]);

    const hotkeyHandler = useObservableState(m.browserInputs.focusedElement$) || null;
    const hotkeyConfig = useObservableState(m.settingsService.hotkeys$, {});
    const withDefaults = {...HotKeyEvents.defaultHotkeys(), ...hotkeyConfig};

    return <HotkeyContext.Provider value={withDefaults}>
        <FocusedElement.Provider value={hotkeyHandler}>
            <PronunciationVideoResizedContext.Provider value={pronunciationVideoResized$}>
                <AudioRecorderResizedContext.Provider value={audioRecorderResized$}>
                    <ImageSearchComponent/>
                    <MiniDrawer/>
                </AudioRecorderResizedContext.Provider>
            </PronunciationVideoResizedContext.Provider>
        </FocusedElement.Provider>
    </HotkeyContext.Provider>
}