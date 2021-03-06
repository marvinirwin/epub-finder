import React, {useContext} from "react"
import {Badge} from "@material-ui/core"
import {FocusedElement, HotkeyContext} from "./main";
import {hotkeyMode, isListening} from "../lib/hotkeys/browser-inputs";
import {Hotkeys} from "../lib/hotkeys/hotkeys.interface";

export interface HotkeyWrapperParams {
    action: keyof Hotkeys<any>
}
export const HotkeyWrapper: React.FunctionComponent<HotkeyWrapperParams> = ({children, action}) => {
    const handler = useContext(FocusedElement);
    const config = useContext(HotkeyContext);
    const mode = isListening(hotkeyMode(handler), action) ?
        'hotkey-active' :
        'hotkey-inactive';
    const keySequence = config[action] || [];
    const keysStr = keySequence.map(key => key === ' ' ? 'Space' : key);

    return <Badge
        badgeContent={<span className={mode}>{ keysStr }</span>}
        color="primary" >
        {children}
    </Badge>
}