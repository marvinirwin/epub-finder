import {TreeMenuNode} from "../tree-menu-node.interface";
import {Reading} from "../../Reading/Reading";
import React from "react";
import {Manager} from "../../../lib/Manager";

export const ReadingNode = (m: Manager, hidden?: boolean): TreeMenuNode => ({
    Component: () => <Reading m={m}/>,
    label: 'Read',
    name: 'reading',
    hidden
})