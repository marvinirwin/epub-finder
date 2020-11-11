import {
    Divider, IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
     Theme, withStyles, withTheme
} from "@material-ui/core";
import React from "react";
import {ArrowBack, KeyboardArrowRight} from "@material-ui/icons";
import {ds_Tree, treeValue, walkTree} from "../../services/tree.service";

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

export type MenuitemInterface = { label: string; key: string }
export const SelectableMenuList: React.FunctionComponent<{ title: string, tree: ds_Tree<MenuitemInterface>, path: string[] }> = (
    {
        title,
        tree,
        path
    }
) => {
    return <List>
        {path.length && (
            <div>
                <ListItem
                    button
                    onClick={() => {
                        // Tell the parent that the path has changd
                    }}
                >
                    <ListItemIcon>
                        <ArrowBack/>
                    </ListItemIcon>
                    <ListItemText primary={treeValue<MenuitemInterface>(tree, ...path)?.label}/>
                </ListItem>
                <Divider/>
            </div>
        )}
        {
            Object.values(walkTree<MenuitemInterface>(tree, ...path)?.children || {}).map((child, index) => <ListItem key={index}>
                {child &&
                <ListItemSecondaryAction
                    onClick={() => {
                        // TODO handle secondary action click
                    }}
                >
                    <IconButton style={{/*marginRight: useMinified ? 150 : undefined*/}}>
                        <KeyboardArrowRight color={'action'}/>
                    </IconButton>
                </ListItemSecondaryAction>
                }
            </ListItem>)
        }
    </List>
}
export default withTheme(withStyles(styles, { withTheme: true })(SelectableMenuList))
