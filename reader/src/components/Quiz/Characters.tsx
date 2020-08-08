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
import {map, take, withLatestFrom} from "rxjs/operators";
import {useObservable, useObservableState} from "observable-hooks";
import {AtomizedSentence} from "../../lib/Atomize/AtomizedSentence";

export function Characters({c, m}: QuizCardProps) {
    const classes = quizStyles();
    let advance = () => m.quizManager.quizzingComponent$.next("Pictures");
    const sentences$ = useObservableState(useObservable<string[], [string | undefined]>(
        (obs$: Observable<[string | undefined]>) =>
            obs$.pipe(
                withLatestFrom(m.textData$),
                map(([[word], {wordSentenceMap}]) =>
                    (wordSentenceMap[word || ''] || []).map((s: AtomizedSentence) => s.translatableText)
                )
            )
        ,[c?.learningLanguage],

    ))

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
            <div style={{display: 'flex', flexFlow: 'column nowrap', textAlign: 'left'}}>
                {(sentences$ || []).map(sentence =>
                    <Typography variant="subtitle2" className={classes.center}>
                        {sentence}
                    </Typography>
                )}
            </div>
        </CardContent>
        <CardActions className={classes.cardActions}>
            <QuizStatsHeader m={m}/>
            <Button onClick={advance}>Next</Button>
        </CardActions>
    </Card>
}