import {ds_Tree} from "../../services/tree.service";
import {TreeMenuNode} from "../directory/tree-menu-node.interface";
import {IconButton, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText} from "@material-ui/core";
import {Inbox, KeyboardArrowRight, Settings} from "@material-ui/icons";
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
    const TreeMenuNode = treeNode.value as TreeMenuNode;

    return <ListItem
        button
        selected={false}
        id={TreeMenuNode?.name}
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
        <ListItemIcon>{TreeMenuNode.LeftIcon ? <TreeMenuNode.LeftIcon/> : <Settings/>}</ListItemIcon>
        <ListItemText primary={TreeMenuNode.label} />
{/*
        {TreeMenuNode?.LeftIcon && <ListItemIcon><TreeMenuNode.LeftIcon/></ListItemIcon>}
*/}
{/*
        {!TreeMenuNode?.InlineComponent && <ListItemText primary={TreeMenuNode?.label}/>}
        {TreeMenuNode?.InlineComponent && <TreeMenuNode.InlineComponent/>}
*/}
{/*
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
*/}
    </ListItem>;
}