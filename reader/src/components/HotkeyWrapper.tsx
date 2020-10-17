import React, {useContext} from "react"
import {Badge} from "@material-ui/core"
import {FocusedElement} from "./Main";
import {hotkeyMode, HotkeyModes, isListening} from "../lib/Manager/BrowserInputs";

export interface HotkeyWrapperParams {
    shortcutKey: string
}
export const HotkeyWrapper: React.FunctionComponent<HotkeyWrapperParams> = ({children, shortcutKey}) => {
    const handler = useContext(FocusedElement);
    const mode = isListening(hotkeyMode(handler), shortcutKey) ?
        'hotkey-active' :
        'hotkey-inactive';

    return <Badge
        badgeContent={<span className={mode}>{shortcutKey}</span>}
        color="primary" >
        {children}
    </Badge>
}