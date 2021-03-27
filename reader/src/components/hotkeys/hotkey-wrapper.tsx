import React, {useContext} from "react"
import {Badge} from "@material-ui/core"
import {FocusedElement, HotkeyContext} from "../main";
import {isListening} from "../../lib/hotkeys/browser-inputs-service";
import {Hotkeys} from "../../lib/hotkeys/hotkeys.interface";
import {hotkeyMode} from "../../lib/hotkeys/hotkey-mode.service";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";

export interface HotkeyWrapperParams {
    action: keyof Hotkeys<any>
}
export const HotkeyWrapper: React.FunctionComponent<HotkeyWrapperParams> = ({children, action}) => {
    const handler = useContext(FocusedElement);
    const config = useContext(HotkeyContext);
    const m = useContext(ManagerContext)
    const mode = useObservableState(m.hotkeyModeService.hotkeyMode$);
    const keySequence = config[action] || [];
    const keysStr = keySequence.map(key => key === ' ' ? 'Space' : key);

    return <Badge
        badgeContent={<span className={`hotkey-mode-${mode}`}>{ keysStr }</span>}
        color="primary" >
        {children}
    </Badge>
}