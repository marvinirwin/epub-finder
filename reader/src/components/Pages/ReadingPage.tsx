import {Manager} from "../../lib/Manager";
import {Card, CardContent, Link, Paper, Slide, Typography} from "@material-ui/core";
import React, {Fragment} from "react";
import {makeStyles} from "@material-ui/core/styles";
import EditingCardComponent from "../Card/EditingCardComponent";
import AudioRecorder, {SLIM_CARD_CONTENT} from "../AudioPopup/AudioRecorder";
import {useObservableState} from "observable-hooks";
import {LibrarySidebar} from "../LibrarySidebar";

const useStyles = makeStyles((theme) => ({
    popup: {
        position: 'absolute',
        right: 0,
        zIndex: 2,
        width: '100vw',
        display: 'flex',
        maxHeight: '1px',
        overflow: 'visible',
        '& > *': {
            height: 'fit-content',
            width: '33vw',
            '& > *': {
                height: 'fit-content',
                flexGrow: 0,
            }
        },
    },

}));

export function SlidingTopWindows({m}: { m: Manager }) {
    const editingCard = useObservableState(m.editingCardManager.editingCard$);
    const showEditingCard = useObservableState<boolean>(m.editingCardManager.showEditingCardPopup$);
    const highlightedPinyin = useObservableState(m.highlightedPinyin$);
    const user = useObservableState(m.authenticationMonitor.user$);
    const classes = useStyles();
    return <Paper className={classes.popup}>
        {
            <Slide direction="down" in={!!showEditingCard}>
                <div>
                    {editingCard &&
                    <EditingCardComponent className={'editing-card-dropdown'} card={editingCard} m={m}/>}
                </div>
            </Slide>
        }
        <div>
            <AudioRecorder m={m}/>
        </div>
        <div style={{display: 'flex', flexFlow: 'row nowrap'}}>
            <Paper style={{...SLIM_CARD_CONTENT, width: '50%'}}>
                <Typography variant="h6">
                    {highlightedPinyin}
                </Typography>
{/*
                <CardContent style={SLIM_CARD_CONTENT}>
                </CardContent>
*/}
            </Paper>
            <Paper>
                {user?.profile.name ? <Typography variant="h6">
                        {user?.profile.name}
                    </Typography> :
                    <Link variant="h6" href={`${process.env.PUBLIC_URL}/login`}>Please Log In</Link>
                }
                <img style={{maxHeight: '100%', width: 'auto'}} src={user?.profile.picture}/>
{/*
                <CardContent >
                </CardContent>
*/}
            </Paper>
        </div>
    </Paper>;
}


export function ReadingPage({m}: { m: Manager }) {
    return <Fragment>
        <SlidingTopWindows m={m}/>
        <LibrarySidebar m={m}/>
    </Fragment>
}