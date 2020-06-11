import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import {makeStyles} from '@material-ui/core/styles';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import PostAddIcon from '@material-ui/icons/PostAdd';
import {Manager} from "../lib/Manager";
import {TextareaAutosize, TextField} from "@material-ui/core";
import MyModal from './MyModal';
import {useObs} from "../UseObs";
import {Tweet} from "../lib/Tweet";
import {SimpleText} from "../lib/SimpleText";

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
    const [, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const simpleTextInput = useObs(m.simpleTextInput$, '');
    const simpleTextTitle = useObs(m.simpleTextTitle$, '');

    const twitterUrlInput = useObs(m.twitterUrl$, '');
    const twitterTitleInput = useObs(m.twitterTitle$, '');
    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar className={classes.toolbar}>

                    <MyModal icon={<NoteAddIcon/>} submit={() => m.bookLoadUpdates$.next(new SimpleText(simpleTextTitle || '', simpleTextInput || ''))}>
                        <form className={classes.root} noValidate autoComplete="off">
                            <TextField value={simpleTextTitle} onChange={v => m.simpleTextTitle$.next(v.target.value)} />
                            <TextareaAutosize
                                aria-label=""
                                placeholder=""
                                value={simpleTextInput}
                                onChange={v => m.simpleTextInput$.next(v.target.value)}
                            />
                        </form>
                    </MyModal>

                    <MyModal icon={<PostAddIcon/>} submit={() => m.bookLoadUpdates$.next(new Tweet(twitterTitleInput || '', twitterUrlInput || ''))}>
                        <form className={classes.root} noValidate autoComplete="off">
                            <TextField value={twitterTitleInput} onChange={v => m.twitterTitle$.next(v.target.value)} />
                            <TextareaAutosize
                                aria-label=""
                                placeholder=""
                                value={twitterUrlInput}
                                onChange={v => m.twitterUrl$.next(v.target.value)}
                            />
                        </form>
                    </MyModal>

                </Toolbar>
            </AppBar>
        </div>
    );
}
