import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import PostAddIcon from '@material-ui/icons/PostAdd';
import {Manager} from "../managers/Manager";
import {TextareaAutosize, TextField} from "@material-ui/core";
import MyModal from './MyModal';
import {useObs} from "../UseObs";
import {SimpleText} from "../managers/RenderingBook";

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

export default function ProminentAppBar({m}: { m: Manager }) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const inputText = useObs(m.inputText$, '');
    const titleText = useObs(m.titleText$, '');
    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar className={classes.toolbar}>
                    <MyModal icon={<NoteAddIcon/>} submit={() => m.bookLoadUpdates$.next(new SimpleText(titleText || '', inputText || ''))}>
                        <form className={classes.root} noValidate autoComplete="off">
                            <TextField value={titleText} onChange={v => m.titleText$.next(v.target.value)} />
                            <TextareaAutosize
                                aria-label=""
                                placeholder=""
                                value={inputText}
                                onChange={v => m.inputText$.next(v.target.value)}
                            />
                        </form>
                    </MyModal>
                    <IconButton aria-label="search" color="inherit">
                        <PostAddIcon/>
                    </IconButton>
                </Toolbar>
            </AppBar>
        </div>
    );
}
