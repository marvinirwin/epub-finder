import {Divider, List, ListItem, ListItemIcon, ListItemText,} from "@material-ui/core";
import React, {Fragment, useContext} from "react";
import {ArrowBack} from "@material-ui/icons";
import {ds_Tree, treeValue, walkTree} from "../../services/tree.service";
import {TreeMenuNode} from "../directory/tree-menu-node.interface";
import {ManagerContext} from "../../App";
import {TreeMenuNodeItem} from "./tree-menu-node-item.component";
import IconButton from "@material-ui/core/IconButton";


export const TreeMenu: React.FunctionComponent<{
    title: string | React.FC,
    tree: ds_Tree<TreeMenuNode>,
    directoryPath: string[],
    directoryChanged: (s: string[]) => void,
    componentChanged: (s: string[]) => void,
    actionSelected: (s: string[]) => void
}> = (
    {
        title,
        tree,
        directoryPath,
        directoryChanged,
        componentChanged,
        actionSelected,
        children
    }
) => {
    const useMinified = false;
    const treeNodes = Object.values(walkTree(tree, ...directoryPath)?.children || {})
        .filter(treeNode => !treeNode?.value?.hidden);

    return <Fragment>
        {
            directoryPath.length ? <ListItem>
                    <IconButton onClick={() => {
                        directoryChanged(directoryPath.slice(0, directoryPath.length - 1));
                    }}>
                        <ArrowBack/>
                    </IconButton>
                </ListItem> :
                null
        }
        {
            treeNodes
                .map((treeNode, index) =>
                    <TreeMenuNodeItem
                        key={Math.random()}
                        treeNode={treeNode}
                        directoryPath={directoryPath}
                        componentChanged={componentChanged}
                        actionSelected={actionSelected}
                        directoryChanged={directoryChanged}
                        useMinified={useMinified}/>
                )
        }
    </Fragment>
    {/*
        {children}
        {directoryPath.length ?
            <Fragment>
                <ListItem
                    button
                    id='tree-menu-node-back-button'
                    onClick={() => {
                        directoryChanged(directoryPath.slice(0, directoryPath.length - 1))
                    }}
                >
                    <ListItemIcon>
                        <ArrowBack/>
                    </ListItemIcon>
                    <ListItemText primary={treeValue(tree, ...directoryPath)?.label}/>
                </ListItem>
                <Divider/>
            </Fragment>
            : <ListItem>
                <Title/>
            </ListItem>
        }
*/
    }
}
