import {Manager} from "../../lib/Manager";
import {Card, CardContent, Slide, Typography, Link} from "@material-ui/core";
import React, {Fragment} from "react";
import {makeStyles} from "@material-ui/core/styles";
import EditingCardComponent from "../Card/EditingCardComponent";
import AudioRecorder, {SLIM_CARD_CONTENT} from "../AudioPopup/AudioRecorder";
import {useObservableState} from "observable-hooks";
import {ClassNameMap} from "@material-ui/core/styles/withStyles";
import {EditingCard} from "../../lib/ReactiveClasses/EditingCard";

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
    const showEditingCard = useObservableState(m.editingCardManager.showEditingCardPopup$);
    const highlightedPinyin = useObservableState(m.highlightedPinyin$);
    const user = useObservableState(m.authenticationMonitor.user$);
    const classes = useStyles();
    return <div className={classes.popup}>
        {
            <Slide direction="down" in={!!showEditingCard}>
                <div>
                    {editingCard && <EditingCardComponent card={editingCard} m={m}/>}
                </div>
            </Slide>
        }
        <div>
            <AudioRecorder m={m}/>
        </div>
        <div style={{display: 'flex', flexFlow: 'row nowrap'}}>
            <Card style={{width: '50%'}}>
                <CardContent style={SLIM_CARD_CONTENT}>
                    <Typography variant="h6">
                        {highlightedPinyin}
                    </Typography>
                </CardContent>
            </Card>
            <Card style={{width: '50%'}}>
                <CardContent style={{...SLIM_CARD_CONTENT, justifyContent: 'space-between', height: '5vh'}}>
                    {user?.name ? <Typography variant="subtitle2">
                            {user?.name || 'Please log in'}
                        </Typography> :
                        <Link href={`${process.env.PUBLIC_URL}/login`}>Please Log In</Link>
                    }
                    <img style={{maxHeight: '100%', width: 'auto'}} src={user?.picture}/>
                </CardContent>
            </Card>
        </div>
    </div>;
}

export function ReadingPage({m}: { m: Manager }) {
    return <SlidingTopWindows m={m}/>
}