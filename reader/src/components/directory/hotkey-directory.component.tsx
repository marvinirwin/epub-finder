import {useObservableState} from "observable-hooks";
import {HotKeyEvents, Hotkeys} from "../../lib/HotKeyEvents";
import {EditableHotkeyComponent} from "../Hotkeys/editable-hotkey.component";
import React, {useContext} from "react";
import {ManagerContext} from "../../App";

export const HotkeyDirectoryComponent = ({action}: {action: keyof Hotkeys<any>}) => {
    const m = useContext(ManagerContext);
    const hotkeys = useObservableState(m.hotkeysService.hotkeysWithDefaults$);
    const defaults = HotKeyEvents.defaultHotkeys();
    return <EditableHotkeyComponent action={action} keyCombo={(hotkeys || defaults)[action]} m={m}/>;
}