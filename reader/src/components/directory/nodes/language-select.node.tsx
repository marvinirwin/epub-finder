import {Settings} from '@material-ui/icons'
import React from "react";
import {TreeMenuNode} from "../tree-menu-node.interface";
import {Manager} from "../../../lib/Manager";


export const LanguageSelectNode = (m: Manager) => ({
    name: 'languageSelect',
    LeftIcon: <Settings/>,
    label: 'Select Language',
    action: () => m.modalService.languageSelect.open$.next(true)
})