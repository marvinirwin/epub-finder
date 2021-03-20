import {Settings} from '@material-ui/icons'
import React from "react";
import {TreeMenuNode} from "../tree-menu-node.interface";
import {Manager} from "../../../lib/Manager";
import {SETTINGS} from "@shared/";

export const SettingsNode =  (m: Manager): TreeMenuNode =>  ( {
    name: SETTINGS,
    LeftIcon: () => <Settings/>,
    action: () => m.modalService.settings.open$.next(true),
    label: 'Settings'
} )