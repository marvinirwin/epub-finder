import {Manager} from "../../lib/manager/Manager";
import {orderBy} from "lodash";
import {EditableHotkeyComponent} from "./editable-hotkey.component";
import React, {useContext} from "react";
import {Hotkeys} from "../../lib/hotkeys/hotkeys.interface";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";

export function HotkeyConfig() {
    const m = useContext(ManagerContext);
    const hotkeyConfig = useObservableState(m.hotkeysService.hotkeyConfiguration$) || {} as Hotkeys<string[]>;
    return <div style={{display: 'flex', flexFlow: 'row wrap'}}>
        {orderBy(Object.entries(hotkeyConfig), ([action]) => action).map(([action, arr]) => {
            return <EditableHotkeyComponent action={action} keyCombo={arr} m={m}/>
        })}
    </div>;
}