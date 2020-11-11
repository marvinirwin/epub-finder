import {
    Divider, IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText, SvgIconTypeMap,
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

export type MenuitemInterface = { label: string; key: string, leftIcon?: string }

export const SelectableMenuList: React.FunctionComponent<{
    title: string,
    tree: ds_Tree<MenuitemInterface>,
    path: string[],
    pathChanged: (s: string[]) => void
}> = (
    {
        title,
        tree,
        path,
        pathChanged
    }
) => {
    const useMinified = false;
    return <List className={'selectable-menu-list'}>
        {path.length ?
                <div>
                    <ListItem
                        button
                        onClick={() => {
                            pathChanged(path.slice(0, path.length - 1))
                        }}
                    >
                        <ListItemIcon>
                            <ArrowBack/>
                        </ListItemIcon>
                        <ListItemText primary={treeValue<MenuitemInterface>(tree, ...path)?.label}/>
                    </ListItem>
                    <Divider/>
                </div> :
            <div>{title}</div>
        }
        {
            Object.values(walkTree<MenuitemInterface>(tree, ...path)?.children || {}).map((child, index) => <ListItem
                key={index}
                button
                selected={false}
            >
                {child?.value?.leftIcon && <ListItemIcon>{child?.value.leftIcon}</ListItemIcon>}
                {!useMinified && <ListItemText primary={child?.value?.label}/>}

                {child &&
                <ListItemSecondaryAction
                    onClick={() => {
                        child?.value?.key && pathChanged(path.concat(child.value.key))
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
export default withTheme(withStyles(styles, {withTheme: true})(SelectableMenuList))
