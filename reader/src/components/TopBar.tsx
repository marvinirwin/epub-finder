import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import PostAddIcon from '@material-ui/icons/PostAdd';
import {Manager} from "../managers/Manager";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(1),
    },
    toolbar: {
        alignItems: 'flex-start',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    title: {
        flexGrow: 1,
        alignSelf: 'flex-end',
    },
}));

export default function ProminentAppBar({m}: {m: Manager}) {
    const classes = useStyles();
    const []

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar className={classes.toolbar}>
                    <IconButton
                        edge="start"
                        className={classes.menuButton}
                        color="inherit"
                        aria-label="Open Add Note"
                    >
                        <NoteAddIcon />
                    </IconButton>
                    <Typography className={classes.title} variant="h6" noWrap>
                        Flash Cards
                    </Typography>
                    <IconButton aria-label="search" color="inherit" onClick={}>
                        <PostAddIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
        </div>
    );
}
