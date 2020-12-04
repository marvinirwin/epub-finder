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
                const treeMenuNode = treeNode?.value;
                return <ListItem
                    key={index}
                    button
                    selected={false}
                    onClick={() => {
                        if (treeMenuNode) {
                            const newPath = directoryPath.concat(treeMenuNode?.name);
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
                    {treeMenuNode?.LeftIcon && <ListItemIcon>{treeMenuNode.LeftIcon}</ListItemIcon>}
                    {!useMinified && !treeMenuNode?.InlineComponent && <ListItemText primary={treeMenuNode?.label}/>}
                    {treeMenuNode?.InlineComponent && <treeMenuNode.InlineComponent/>}
                    {treeMenuNode?.moveDirectory && <ListItemSecondaryAction>
                        <IconButton
                            style={{marginRight: useMinified ? 150 : undefined}}
                            onClick={() => {
                                treeMenuNode && directoryChanged(directoryPath.concat(treeMenuNode.name))
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
