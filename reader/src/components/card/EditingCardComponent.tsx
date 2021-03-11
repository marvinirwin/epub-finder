import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import {EditingCard} from "../../lib/reactive-classes/EditingCard";
import ImageList from "./CardImageList";
import EditCardEnglish from "./EditCardEnglish";
import {TutorialPopper} from "../popover/tutorial-popper.component";
import {useObservableState, useSubscription} from "observable-hooks";
import {Manager} from "../../lib/Manager";
import {IconButton} from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';
import Done from '@material-ui/icons/Done';
import {HotkeyWrapper} from "../hotkey-wrapper";
import {ScheduleRow, ScheduleRowData} from "../../lib/schedule/schedule-row";

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        '& > *': {
            width: '100%'
        },
        position: 'relative',
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
}));

const EditingCardComponent: React.FunctionComponent<{ card: EditingCard, m: Manager, className?: string }> = ({
                                                                                                                  card,
                                                                                                                  m,
                                                                                                                  className
                                                                                                              }) => {
    const classes = useStyles();
    const characters = useObservableState(card.learningLanguage$);
    const sounds = useObservableState(card.sounds$);
    const translation = useObservableState(card.translation$);
    useEffect(() => {
        const els = document.getElementsByClassName('new-audio');
        for (let i = 0; i < els.length; i++) {
            // @ts-ignore
            els[i].play();
        }
    }, [sounds]);

    // const pinyin = useObservableState(card.pinyin$);
    const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);

    useSubscription(
        m.hotkeyEvents.deleteCard$,
        () => {
            if (characters) {
                m.cardsRepository.deleteWords.next([characters])
                m.editingCardManager.queEditingCard$.next(undefined);
            }
        }
    )
    const scheduleRowIndex = useObservableState(m.scheduleRowsService.indexedScheduleRows$);
    const scheduleRow: ScheduleRow | undefined = (scheduleRowIndex && characters) ? scheduleRowIndex[characters] : undefined;
    const score = scheduleRow?.wordRecognitionScore()

    return <Card className={`${className || ''} ${classes.root}`}>
        <CardContent ref={setReferenceElement}>
            <div className={classes.root}>
                <div style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between'}}>
                    <HotkeyWrapper action={"HIDE"}>
                        <IconButton aria-label="keyboard_arrow_up" onClick={() => m.hotkeyEvents.hide$.next()}>
                            <KeyboardArrowUp fontSize="small"/>
                        </IconButton>
                    </HotkeyWrapper>
                    <HotkeyWrapper action={"MARK_AS_KNOWN"}>
                        <IconButton aria-label="done" onClick={() => characters && m.quizManager.quizResult$.next({
                            word: characters,
                            grade: 2
                        })}>
                            <Done fontSize="small"/>
                        </IconButton>
                    </HotkeyWrapper>
                    {/*
                        <Typography variant="subtitle1" gutterBottom> {characters} ({pinyin}) ({score})</Typography>
*/}
                    <Typography variant="subtitle1" gutterBottom> {translation} </Typography>
                    <HotkeyWrapper action={"DELETE_CARD"}>
                        <IconButton aria-label="delete" onClick={() => m.hotkeyEvents.deleteCard$.next()}>
                            <DeleteIcon fontSize="large"/>
                        </IconButton>
                    </HotkeyWrapper>
                </div>
                <EditCardEnglish e={card}/>
                <Typography variant="h6" gutterBottom> Pictures </Typography>
                <ImageList photos$={card.photos$} card={card} characters={characters || ""} m={m}/>
            </div>
            <TutorialPopper referenceElement={referenceElement} storageKey={'EDITING_CARD'} placement="bottom-start">
                <Typography variant="subtitle2">This is a flashcard, edit it by adding definitions, and stimulating
                    pictures to aid memorization.</Typography>
            </TutorialPopper>
        </CardContent>
    </Card>;
}

export default EditingCardComponent;