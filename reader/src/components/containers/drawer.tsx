import React, {useContext} from 'react';
import clsx from 'clsx';
import {createStyles, makeStyles, useTheme, Theme} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {TreeMenu} from "../tree-menu/tree-menu.component";
import {AllItemsContainer} from "./all-items-container.component";
import {AppBar, Divider, List, Toolbar} from "@material-ui/core";
import {theme} from "../../theme";
import {Menu} from "@material-ui/icons";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
        },
        appBar: {
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
        appBarShift: {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        menuButton: {
            marginRight: 36,
        },
        hide: {
            display: 'none',
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
            whiteSpace: 'nowrap',
        },
        drawerOpen: {
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        drawerClose: {
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden',
            width: theme.spacing(7) + 1,
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9) + 1,
            },
        },
        toolbar: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
        },
        content: {
            flexGrow: 1,
            display: 'flex',
            flexFlow: 'column nowrap'
        },
    }),
);

export const MiniDrawer: React.FC<{}> = ({children}) => {
    const m = useContext(ManagerContext);
    const treeMenuService = m.treeMenuService;
    const menuItemTree = useObservableState(treeMenuService.tree.updates$);
    const directoryPath = useObservableState(m.settingsService.directoryPath$) || '';
    const open = useObservableState(m.settingsService.drawerClosed$) || false;

    const classes = useStyles();
    const handleDrawerOpen = () => {
        m.settingsService.drawerClosed$.next(true);
    };

    const handleDrawerClose = () => {
        m.settingsService.drawerClosed$.next(false);
    };

    return (
        <div className={`app-container ${classes.root}`}>
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: open,
                        })}
                    >
                        <Menu />
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        Language Trainer
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
            >
                <div className={classes.toolbar}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </div>
                <Divider />
                <List>
                    {
                        menuItemTree?.sourced && <TreeMenu
                            title={() => <Typography
                                ref={ref => m.introService.titleRef$.next(ref)}
                                variant='h6'>
                            </Typography>
                            }
                            tree={menuItemTree.sourced}
                            directoryPath={directoryPath.split('.').filter(v => v)}
                            directoryChanged={directoryPath => m.settingsService.directoryPath$.next(directoryPath.join('.'))}
                            componentChanged={componentPath => {
                                m.settingsService.componentPath$.next(componentPath.join('.'));
                            }}
                            actionSelected={actionPath => treeMenuService.actionSelected$.next(actionPath)}
                        >
                            {/*
                        <ListItem button>
                            <IconButton onClick={ () => setOpen(!open)}>
                                {open ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
                            </IconButton>
                        </ListItem>
*/}
                        </TreeMenu>
                    }
                </List>
            </Drawer>
            <div className={classes.content}>
                <div className={classes.toolbar} />
                <AllItemsContainer className={`all-items-container`}/>
            </div>
        </div>
    );
}
