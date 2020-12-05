import {
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Theme, Typography,
    withStyles,
    withTheme
} from "@material-ui/core";
import React from "react";
import {ArrowBack, KeyboardArrowRight} from "@material-ui/icons";
import {ds_Tree, treeValue, walkTree} from "../../services/tree.service";
import {TreeMenuNode} from "../../services/tree-menu-node.interface";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
    title: {
        padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(
            3
        )}px`,
    }
}))

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
        actionSelected
    }
) => {
    const classes = useStyles()
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
            <Typography variant="h6" className={classes.title}>{title}</Typography>
        }
        {
            Object.values(walkTree(tree, ...directoryPath)?.children || {}).map((treeNode, index) => {
                const TreeMenuNode = treeNode?.value;
                if (TreeMenuNode?.ReplaceComponent) {
                    return <TreeMenuNode.ReplaceComponent key={index}/>
                }

                return <ListItem
                    key={index}
                    button
                    selected={false}
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
                    {!useMinified && !TreeMenuNode?.InlineComponent && <ListItemText primary={TreeMenuNode?.label}/>}
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
            })
        }
    </List>
}
