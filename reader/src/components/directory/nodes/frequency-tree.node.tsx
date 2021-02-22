import {TreeMenuNode} from "../tree-menu-node.interface";
import React, {useContext} from "react";
import {AccountCircle, DeviceHub, Settings} from "@material-ui/icons";
import {AUTH, PROGRESS_TREE} from "@shared/";
import {ManagerContext} from "../../../App";
import {useObservableState} from "observable-hooks";
import {FrequencyTreeNode} from "../../frequency-tree-node.component";
import {Typography} from "@material-ui/core";


const FrequencyTreeComponent = () => {
    const m = useContext(ManagerContext);
    const tree = useObservableState((m.progressTreeService.tree$))
    return tree ?
        <FrequencyTreeNode
            frequencyNode={tree}
            similarity={undefined}
        /> :
        <Typography>Frequency tree not found</Typography>
};

export const FrequencyTreeMenuNode = (): TreeMenuNode => ({
    name: PROGRESS_TREE,
    label: 'Progress Tree',
    Component: () => <FrequencyTreeComponent/>,
    LeftIcon: () => <DeviceHub/>
});