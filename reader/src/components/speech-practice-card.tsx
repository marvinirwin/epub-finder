import {useObservableState} from "observable-hooks";
import React, {useContext} from "react";
import {ManagerContext} from "../App";
import {makeStyles} from "@material-ui/core/styles";
import Card from "@material-ui/core/Card/Card";
import {CardContent, Input, Typography} from "@material-ui/core";

const useStyles = makeStyles({
    root: {
        minWidth: 275,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    pos: {
        marginBottom: 12,
    },
});

export const SpeechPracticeCard = () => {
    const m = useContext(ManagerContext);
    const classes = useStyles();
    const recordedText = useObservableState(m.speechPracticeService.learningLanguage$) || '';
    const romanization = useObservableState(m.speechPracticeService.romanization$) || '';
    const translation = useObservableState(m.speechPracticeService.translation$) || '';
    return <Card className={classes.root} id={'speech-practice-card'} variant="outlined">
        <CardContent>
            <Typography
                variant="h5"
                component="h2"
                id={'speech-practice-learning-language'}>
                {recordedText}
            </Typography>
            <Typography
                className={classes.pos}
                color="textSecondary"
                id={'speech-practice-romanization'}>
                {romanization}
            </Typography>
            <Typography
                id={'speech-practice-translated'}
                variant="body2"
                component="p">
                {translation}
            </Typography>
        </CardContent>
    </Card>
}