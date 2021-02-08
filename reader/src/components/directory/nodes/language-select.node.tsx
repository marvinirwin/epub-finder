import {Language} from '@material-ui/icons'
import React from "react";
import {TreeMenuNode} from "../tree-menu-node.interface";
import {Manager} from "../../../lib/Manager";
import {LANGUAGE_SELECT} from "@shared/";


export const LanguageSelectNode = (m: Manager): TreeMenuNode => ({
    name: LANGUAGE_SELECT,
    LeftIcon: () => <Language/>,
    label: 'Select Language',
    action: () => m.modalService.languageSelect.open$.next(true)
})