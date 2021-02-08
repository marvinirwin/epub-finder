import {TreeMenuNode} from "../tree-menu-node.interface";
import React from "react";
import {Manager} from "../../../lib/Manager";
import {ReadingComponent} from "../../reading/reading.component";
import {Book, Settings} from "@material-ui/icons";
import { READING_NODE } from "@shared/";

export const ReadingNode = (m: Manager, hidden?: boolean): TreeMenuNode => ({
    Component: () => <ReadingComponent m={m}/>,
    label: 'Read',
    name: READING_NODE,
    LeftIcon: () => <Book/>,
    hidden
})