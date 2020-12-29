import {ds_Tree} from "../../services/tree.service";
import {TreeMenuNode} from "../directory/tree-menu-node.interface";
import {IconButton, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText} from "@material-ui/core";
import {KeyboardArrowRight} from "@material-ui/icons";
import React from "react";

export function TreeMenuNodeItem(
    {
        treeNode,
        directoryPath,
        componentChanged,
        actionSelected,
        directoryChanged,
        useMinified
    }: {
        treeNode: ds_Tree<TreeMenuNode>,
        directoryPath: string[], componentChanged: (s: string[]) => void,
        actionSelected: (s: string[]) => void,
        directoryChanged: (s: string[]) => void,
        useMinified: boolean
    }) {
    const TreeMenuNode = treeNode?.value;
    if (TreeMenuNode?.ReplaceComponent) {
        return <TreeMenuNode.ReplaceComponent/>;
    }

    return <ListItem
        button
        selected={false}
        id={TreeMenuNode?.name}
        className={`tree-menu-node`}
        onClick={() => {
            if (TreeMenuNode) {
                const newPath = directoryPath.concat(TreeMenuNode?.name);
                if (TreeMenuNode.Component) {
                    componentChanged(newPath);
                }
                if (TreeMenuNode.action) {
                    actionSelected(newPath);
                }
                if (TreeMenuNode.moveDirectory) {
                    directoryChanged(newPath);
                }
            }
        }}
    >
        {TreeMenuNode?.LeftIcon && <ListItemIcon>{TreeMenuNode.LeftIcon}</ListItemIcon>}
        {!useMinified && !TreeMenuNode?.InlineComponent &&
        <ListItemText primary={TreeMenuNode?.label}/>}
        {TreeMenuNode?.InlineComponent && <TreeMenuNode.InlineComponent/>}
        {TreeMenuNode?.moveDirectory && <ListItemSecondaryAction>
            <IconButton
                style={{marginRight: useMinified ? 150 : undefined}}
                onClick={() => {
                    TreeMenuNode && directoryChanged(directoryPath.concat(TreeMenuNode.name))
                }}
            >
                <KeyboardArrowRight color={'action'}/>
            </IconButton>
        </ListItemSecondaryAction>
        }
    </ListItem>;
}