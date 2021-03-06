import {manualHotkeyInput, submitManualHotkeyButton} from "@shared/";
import {useContext, useState} from "react";
import {ManagerContext} from "../../../App";
import React from "react";
import {useObservableState} from "observable-hooks";

export const ManualHotkey = () => {
    const m = useContext(ManagerContext);
    const [manualHotkeyText, setManualHotkeyText] = useState('');
    return <div>
        <input
            onChange={v => setManualHotkeyText(v.target.value)}
            id={manualHotkeyInput}/>
        <button
            id={submitManualHotkeyButton}
            onClick={() => m.browserInputs.pressHotkey([manualHotkeyText])}
        >press manual hotkey
        </button>
    </div>
};