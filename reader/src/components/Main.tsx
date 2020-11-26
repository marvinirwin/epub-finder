import React, {useEffect} from "react";
import {Manager} from "../lib/Manager";
import {NavigationPages} from "../lib/Util/Util";
import {useObservableState} from "observable-hooks";
import {HotKeyEvents, Hotkeys} from "../lib/HotKeyEvents";
import {AppDirectoryService} from "./directory/app-directory-service";
import {AppContainer} from "./Containers/AppContainer";
import {TreeMenuService} from "../services/tree-menu.service";
import {Subject} from "rxjs";


export const FocusedElement = React.createContext<HTMLElement | Document | null>(null)
export const HotkeyContext = React.createContext<Partial<Hotkeys<string[]>>>({})
const audioRecorderResized$ = new Subject<void>();
const pronunciationVideoResized$ = new Subject<void>();
export const AudioRecorderResizedContext = React.createContext<Subject<void>>(audioRecorderResized$)
export const PronunciationVideoResizedContext = React.createContext<Subject<void>>(pronunciationVideoResized$)

const treeMenuService = new TreeMenuService<any, {value: any}>();

export function Main({m}: { m: Manager }) {
    const currentPage = useObservableState(m.bottomNavigationValue$);
    useEffect(() => {
        m.inputManager.applyDocumentListeners(document);
        AppDirectoryService(m).subscribe(v => treeMenuService.tree.appendDelta$.next(v));
    }, [m]);


    const alertMessagesVisible = useObservableState(m.alertMessagesVisible$);
    const alertMessages = useObservableState(m.alertMessages$);

    const hotkeyHandler = useObservableState(m.inputManager.focusedElement$) || null;
    const hotkeyConfig = useObservableState(m.settingsService.hotkeys$, {});
    const withDefaults = {...HotKeyEvents.defaultHotkeys(), ...hotkeyConfig};

    return <HotkeyContext.Provider value={withDefaults}>
        <FocusedElement.Provider value={hotkeyHandler}>
            <PronunciationVideoResizedContext.Provider value={pronunciationVideoResized$}>
                <AudioRecorderResizedContext.Provider value={audioRecorderResized$}>
                    <AppContainer treeMenuService={treeMenuService}/>
                </AudioRecorderResizedContext.Provider>
            </PronunciationVideoResizedContext.Provider>
        </FocusedElement.Provider>
    </HotkeyContext.Provider>
}