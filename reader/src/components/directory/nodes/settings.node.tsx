import {Settings} from '@material-ui/icons'
import React from "react";
import {TreeMenuNode} from "../tree-menu-node.interface";
export const SettingsNode =  {
    name: 'settings',
    LeftIcon: () => <Settings/>,
    moveDirectory: true
} as TreeMenuNode