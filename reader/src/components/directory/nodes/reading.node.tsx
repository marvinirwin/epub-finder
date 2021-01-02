import {TreeMenuNode} from "../tree-menu-node.interface";
import React from "react";
import {Manager} from "../../../lib/Manager";
import {ReadingComponent} from "../../reading/reading.component";

export const READING_NODE = 'reading';
export const ReadingNode = (m: Manager, hidden?: boolean): TreeMenuNode => ({
    Component: () => <ReadingComponent m={m}/>,
    label: 'Read',
    name: READING_NODE,
    hidden
})