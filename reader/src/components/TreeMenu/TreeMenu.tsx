import {
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Theme,
    withStyles,
    withTheme
} from "@material-ui/core";
import React from "react";
import {ArrowBack, KeyboardArrowRight} from "@material-ui/icons";
import {ds_Tree, treeValue, walkTree} from "../../services/tree.service";
import {TreeMenuNode} from "../../services/tree-menu-node.interface";

const styles = (theme: Theme) => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper
    },
    icon: {
        color: theme.palette.primary.contrastText
    }
})

export const TreeMenu: React.FunctionComponent<{
    title: string,
    tree: ds_Tree<TreeMenuNode<any, any>>,
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
        actionSelected
    }
) => {
    const useMinified = false;
    return <List className={'selectable-menu-list'}>
        {directoryPath.length ?
            <div>
                <ListItem
                    button
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
            </div> :
            <div>{title}</div>
        }
        {
            Object.values(walkTree(tree, ...directoryPath)?.children || {}).map((treeNode, index) => {
                const treeMenuNode = treeNode?.value;
                return <ListItem
                    key={index}
                    button
                    selected={false}
                    onClick={() => {
                        if (treeMenuNode) {
                            const newPath = directoryPath.concat(treeMenuNode?.label);
                            if (treeMenuNode.Component) {
                                componentChanged(newPath);
                            }
                            if (treeMenuNode.action) {
                                actionSelected(newPath);
                            }
                            if (treeMenuNode.moveDirectory) {
                                directoryChanged(newPath);
                            }
                        }
                    }}
                >
                    {treeMenuNode?.leftIcon && <ListItemIcon>{treeMenuNode.leftIcon}</ListItemIcon>}
                    {!useMinified && <ListItemText primary={treeMenuNode?.label}/>}

                    {treeNode &&
                    <ListItemSecondaryAction
                    >
                        <IconButton
                            style={{marginRight: useMinified ? 150 : undefined}}
                            onClick={() => {
                                treeMenuNode && directoryChanged(directoryPath.concat(treeMenuNode.key))
                            }}
                        >
                            <KeyboardArrowRight color={'action'}/>
                        </IconButton>
                    </ListItemSecondaryAction>
                    }
                </ListItem>;
            })
        }
    </List>
}
