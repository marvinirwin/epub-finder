import {Profile} from "../../../lib/auth/loggedInUserService";
import {TreeMenuNode} from "../tree-menu-node.interface";
import React, {useContext} from "react";
import {AccountCircle, Settings} from "@material-ui/icons";
import {AUTH, PROGRESS_TREE} from "@shared/";
import {ManagerContext} from "../../../App";
import {useObservableState} from "observable-hooks";
import {FrequencyTreeNode} from "../../frequency-tree-node.component";
import {Typography} from "@material-ui/core";
import {LearningTree} from "../../../lib/learning-tree/learning-tree";


const ProgressTree = () => {
    const m = useContext(ManagerContext);
    const tree = useObservableState((m.progressTreeService.tree$))
    return tree ?
        <FrequencyTreeNode
            frequencyNode={tree}
            similarity={LearningTree.memoizedSimilarityTabulation(
                tree.value?.tabulation,
                tree.value?.tabulation
            )}
        /> :
        <Typography>No frequency tree enabled</Typography>
};

export const FrequencyTreeMenuNode = (): TreeMenuNode => ({
    name: PROGRESS_TREE,
    label: 'Progress Tree',
    Component: () => <ProgressTree/>,
    LeftIcon: () => <Settings/>
});