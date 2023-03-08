import {Manager} from "../../lib/manager/Manager";
import {TreeMenuNode} from "./tree-menu-node.interface";
import {ReadingComponent} from "../reading/reading.component";
import {DEV} from "../../lib/util/url-params";
import React from "react";

export const ReadingNode = (m: Manager): TreeMenuNode => ({
    Component: () => <ReadingComponent/>,
    label: 'Read',
    name: 'reading',
    hidden: !DEV,
})