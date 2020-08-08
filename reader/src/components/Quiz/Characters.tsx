import {Card, CardActions, CardContent} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import React, {useEffect, useState} from "react";
import {QuizCardProps} from "./Popup";
import {Pictures} from "./Pictures";
import {quizStyles} from "./QuizStyles";
import {usePipe, useSub} from "../../lib/UseObs";
import {Observable} from "rxjs";
import QuizStatsHeader from "./QuizStatsHeaders";
import {take} from "rxjs/operators";

export function Characters({c, m}: QuizCardProps) {
    const classes = quizStyles();
    let advance = () => m.quizManager.quizzingComponent$.next("Pictures");
    const [error, setError] = useState('');
    useEffect(() => {
        setError("");// The card has changed, clear the error message
        if (!c) return;
        m.audioManager.audioRecorder.quedRecordRequest$.next({
            duration: 1,
            cb: async (createdSentence: string) => {
                if (!createdSentence) {
                    return;
                }
                if (!createdSentence.includes(c.learningLanguage)) {
                    setError(`The synthesized sentence (${createdSentence}) does not contain ${c.learningLanguage}`)
                }
                const allPreviousCreatedSentence = await m.createdSentenceManager.allCreatedSentences$.pipe(
                    take(1),
                ).toPromise();

                if (allPreviousCreatedSentence[createdSentence]) {
                    setError(`You have already said ${createdSentence}`)
                } else {
                    setError('');
                    m.createdSentenceManager
                        .addUnpersistedCreatedSentence$
                        .next([{learningLanguage: createdSentence}])
                    advance();
                }
            },
            label: c?.learningLanguage,
        })
    }, [c])
    return <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
            <Typography variant="h1" component="h1" className={classes.center}>
                {c?.learningLanguage}
            </Typography>
        </CardContent>
        <CardActions className={classes.cardActions}>
            <QuizStatsHeader m={m}/>
            <Button onClick={advance}>Next</Button>
        </CardActions>
    </Card>
}