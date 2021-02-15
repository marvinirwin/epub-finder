import {Manager} from "../../lib/Manager";
import {orderBy} from "lodash";
import {EditableHotkeyComponent} from "./editable-hotkey.component";
import React from "react";
import {Hotkeys} from "../../lib/hotkeys/hotkeys.interface";

export function HotkeyConfig({hotkeyConfig, m}: { hotkeyConfig: Partial<Hotkeys<string[]>>, m: Manager }) {
    return <div>
        {orderBy(Object.entries(hotkeyConfig), ([action]) => action).map(([action, arr]) => {
            return <EditableHotkeyComponent action={action} keyCombo={arr} m={m}/>
        })}
    </div>;
}