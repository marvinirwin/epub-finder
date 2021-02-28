import {useObservableState} from "observable-hooks";
import React, {useContext} from "react";
import {ManagerContext} from "../App";
import {makeStyles} from "@material-ui/core/styles";
import Card from "@material-ui/core/Card/Card";
import {CardContent, Typography} from "@material-ui/core";

const useStyles = makeStyles({
    root: {
        margin: 8 * 4,
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
    const languageConfig = m.languageConfigsService;
    const lang = useObservableState(m.settingsService.readingLanguage$);
    const speechCode = useObservableState(m.settingsService.spokenLanguage$);
    const recognitionSupported = !!speechCode;
    const romanizationSupported = !!useObservableState(languageConfig.learningToLatinTransliterateFn$);
    const translationSupported = !!useObservableState(languageConfig.learningToKnownTranslateFn$);
    const classes = useStyles();

    const recordedText = useObservableState(m.speechPracticeService.learningLanguage$) ||
    (recognitionSupported ? `Speech recognition for ${speechCode} available, try it!` :
        ``);

    const romanization = useObservableState(m.speechPracticeService.romanization$) ||
    (romanizationSupported ? `Romanization for ${lang} available` :
        ``);

    const translation = useObservableState(m.speechPracticeService.translation$) ||
    (translationSupported ? `Translation for ${lang} available` :
        ``);

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