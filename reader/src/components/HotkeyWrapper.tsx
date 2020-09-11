import React, {Fragment} from "react"
import {Badge} from "@material-ui/core"

export interface HotkeyWrapperParams {
    shortcutKey: string
}
export const HotkeyWrapper: React.FunctionComponent<HotkeyWrapperParams> = ({children, shortcutKey}) => {
    return <Badge badgeContent={shortcutKey} color="primary">
        {children}
    </Badge>
}