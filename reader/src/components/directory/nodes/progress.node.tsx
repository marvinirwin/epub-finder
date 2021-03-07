import {TreeMenuNode} from "../tree-menu-node.interface";
import React from "react";
import {TrendingUp} from "@material-ui/icons";
import {PROGRESS_NODE} from "@shared/";
import {ProgressTableComponent} from "../../../quiz-progress/progress-table.component";


export const ProgressNode: TreeMenuNode = {
    name: PROGRESS_NODE,
    label: 'Progress',
    Component: ProgressTableComponent,
    LeftIcon: () => <TrendingUp/>
}