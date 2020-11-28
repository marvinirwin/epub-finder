import React, {useContext} from "react"
import {Badge} from "@material-ui/core"
import {FocusedElement, HotkeyContext} from "./Main";
import {hotkeyMode, isListening} from "../lib/Hotkeys/BrowserInputs";
import {HotkeyModes} from "../lib/Hotkeys/HotkeyModes";
import {Hotkeys} from "../lib/Hotkeys/hotkeys.interface";

export interface HotkeyWrapperParams {
    action: keyof Hotkeys<any>
}
export const HotkeyWrapper: React.FunctionComponent<HotkeyWrapperParams> = ({children, action}) => {
    const handler = useContext(FocusedElement);
    const config = useContext(HotkeyContext);
    const mode = isListening(hotkeyMode(handler), action) ?
        'hotkey-active' :
        'hotkey-inactive';

    return <Badge
        badgeContent={<span className={mode}>{config[action]}</span>}
        color="primary" >
        {children}
    </Badge>
}