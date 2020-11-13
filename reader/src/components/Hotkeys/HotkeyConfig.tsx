import {Hotkeys} from "../../lib/HotKeyEvents";
import {Manager} from "../../lib/Manager";
import {orderBy} from "lodash";
import {EditableHotkey} from "./EditableHotkey";
import React from "react";

export function HotkeyConfig({hotkeyConfig, m}: { hotkeyConfig: Partial<Hotkeys<string[]>>, m: Manager }) {
    return <div>
        {orderBy(Object.entries(hotkeyConfig), ([action]) => action).map(([action, arr]) => {
            return <EditableHotkey action={action} keyCombo={arr} m={m}/>
        })}
    </div>;
}