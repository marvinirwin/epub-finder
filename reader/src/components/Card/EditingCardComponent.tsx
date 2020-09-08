import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import {EditingCard} from "../../lib/ReactiveClasses/EditingCard";
import ImageList from "./CardImageList";
import EditCardEnglish from "./EditCardEnglish";
import {TutorialPopper} from "../Popover/Tutorial";
import {useObservableState} from "observable-hooks";
import {Manager} from "../../lib/Manager";
import {IconButton} from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';



const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        '& > *': {
            width: '100%'
        },
        position: 'relative'
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


export default function EditingCardComponent({card, m}: { card: EditingCard, m: Manager}) {
    const classes = useStyles();
    const characters = useObservableState(card.learningLanguage$);
    const sounds = useObservableState(card.sounds$);
    useEffect(() => {
        const els = document.getElementsByClassName('new-audio');
        for (let i = 0; i < els.length; i++) {
            // @ts-ignore
            els[i].play();
        }
    }, [sounds]);

    const pinyin = useObservableState(card.pinyin$);
    const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
    return <Card className={classes.root}>
            <CardContent ref={setReferenceElement}>
                <div className={classes.root}>
                    <IconButton aria-label="delete" onClick={() => characters && m.cardManager.deleteCards$.next([characters]) && m.editingCardManager.queEditingCard$.next(undefined)}>
                        <DeleteIcon fontSize="large" />
                    </IconButton>
                    <Typography variant="subtitle1" gutterBottom> {characters} ({pinyin}) </Typography>
                    <EditCardEnglish e={card}/>
                    <Typography variant="h6" gutterBottom> Pictures </Typography>
                    <ImageList photos$={card.photos$} card={card} characters={characters || ""} m={m}/>
                </div>
                <TutorialPopper referenceElement={referenceElement} storageKey={'EDITING_CARD'} placement="bottom-start">
                    <Typography variant="subtitle2">This is a flashcard, edit it by adding definitions, and stimulating pictures to aid memorization.</Typography>
                </TutorialPopper>
            </CardContent>
        </Card> ;
}