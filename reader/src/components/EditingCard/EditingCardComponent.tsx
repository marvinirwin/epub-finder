import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {useObs} from "../../lib/UseObs";
import {EditingCard} from "../../lib/ReactiveClasses/EditingCard";
import ImageList from "../CardImageList";
import EditCardEnglish from "../EditCardEnglish";
import CircularIntegration, {SpinnerState} from '../SpinningCircle'
import {SoundEl} from "../SoundElement";
import {AudioRecorder, AudioTest} from "../../lib/AudioRecorder";

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        '& > *': {
            width: '100%'
        }
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


export default function EditingCardComponent({card}: { card: EditingCard }) {
    const classes = useStyles();
    const [expanded, setExpanded] = React.useState(false);
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };
    const progress = useObs(card.saveInProgress$);
    const characters = useObs(card.learningLanguage$);
    const deck = useObs(card.deck$);
    const english = useObs(card.knownLanguage$);
    const sounds = useObs(card.sounds$);
    const photos = useObs(card.photos$);
    const frontPhotos = useObs(card.illustrationPhotos$);
    useEffect(() => {
        const els = document.getElementsByClassName('new-audio');
        for (let i = 0; i < els.length; i++) {
            // @ts-ignore
            els[i].play();
        }
    }, [sounds]);

/*
    const [test, setTest] = useState<AudioTest | undefined>();
*/
/*
    useEffect(() => {
        if (characters) { // TODO shouldn't knownLanguage be entirely replaced with characters?
            let audioTest = new AudioTest();
            audioTest.text$.next(characters)
            setTest(audioTest)
        }
    }, [characters]);
*/
    const pinyin = useObs(card.pinyin$);

    return (
        <Card className={classes.root}>
            <CardContent>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom> {characters} ({pinyin}) </Typography>
                    <EditCardEnglish e={card}/>
                    <Typography variant="h6" gutterBottom> Pictures </Typography>
                    <ImageList photos$={card.photos$} card={card} characters={characters || ""} m={card.m}/>
                </div>
            </CardContent>
        </Card>
    );
}