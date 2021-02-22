import {Profile} from "../../../lib/auth/loggedInUserService";
import {TreeMenuNode} from "../tree-menu-node.interface";
import React, {useContext} from "react";
import {AccountCircle, Settings} from "@material-ui/icons";
import {AUTH, PROGRESS_TREE} from "@shared/";
import {ManagerContext} from "../../../App";


const ProgressTree = () => {
    const m = useContext(ManagerContext);
    return <div>

    </div>
};

export const FrequencyTreeNode = (): TreeMenuNode => ({
    name: PROGRESS_TREE,
    label: 'Progress Tree',
    Component: () => <ProgressTree/>,
    LeftIcon: () => <Settings/>
});