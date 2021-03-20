import {useObservableState} from "observable-hooks";
import {HotKeyEvents} from "../../lib/HotKeyEvents";
import {EditableHotkeyComponent} from "../hotkeys/editable-hotkey.component";
import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {Hotkeys} from "../../lib/hotkeys/hotkeys.interface";

export const HotkeyDirectoryComponent = ({action}: {action: keyof Hotkeys<any>}) => {
    const m = useContext(ManagerContext);
    const hotkeys = useObservableState(m.hotkeysService.hotkeyConfiguration$);
    const defaults = HotKeyEvents.defaultHotkeys();
    return <EditableHotkeyComponent action={action} keyCombo={(hotkeys || defaults)[action]} m={m}/>;
}