/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import AtomizeSrcdoc from 'Worker-loader?name=dist/[name].js!../../lib/Worker/AtomizeSrcdoc';
import {Card, CardActions, CardContent} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import React, {useEffect, useState} from "react";
import {QuizCardProps} from "./Popup";
import {Pictures} from "./Pictures";
import {quizStyles} from "./QuizStyles";
import {combineLatest, Observable} from "rxjs";
import QuizStatsHeader from "./QuizStatsHeaders";
import {distinctUntilChanged, filter, map, switchMap, take, tap} from "rxjs/operators";
import {useObservable, useObservableState} from "observable-hooks";
import {OpenBook} from "../../lib/BookFrame/OpenBook";
import {FrameContainer} from "../Frame/FrameContainer";
import {BrowserInputs} from "../../lib/Manager/BrowserInputs";
import {GetWorkerResults} from "../../lib/Util/GetWorkerResults";
import {isEqual, uniq} from "lodash";
import {AtomizedSentence} from "../../lib/Atomized/AtomizedSentence";
import {OpenBooks} from "../../lib/Manager/OpenBooks";
import {RecordRequest} from "../../lib/Interfaces/RecordRequest";


export function Characters({c, m}: QuizCardProps) {
    const classes = quizStyles();
    const [error, setError] = useState('');
    const [createdSentence, setCreatedSentence] = useState();
    const advance = () => {
        m.quizManager.quizzingComponent$.next("Pictures");
/*
        if (createdSentence) {
        } else {
            const r = new RecordRequest(`Please record sentence with the word ${c?.learningLanguage}`);
            r.sentence.then(setCreatedSentence)
        }
*/
    };

    useEffect(() => {
        setError('');// The card has changed, clear the error message
        if (!c?.learningLanguage) return;
        const r = new RecordRequest(`Please record sentence with the word ${c?.learningLanguage}`);
        r.sentence.then(async createdSentence => {
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
                setError(`Sentence "${createdSentence}" recorded`);
                advance();
            }
        })
    }, [c?.learningLanguage]);


    return <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
            <Typography variant="h3">{error}</Typography>
            <div>
                <Typography variant="h1" component="h1" className={classes.center}>
                    {c?.learningLanguage}
                </Typography>
            </div>
            <div style={{flexGrow: 1, width: '100%'}}>
                {
                    m.quizCharacterManager.exampleSentencesFrame
                    && <FrameContainer rb={m.quizCharacterManager.exampleSentencesFrame} m={m}/>
                }
            </div>
        </CardContent>
        <CardActions className={classes.cardActions}>
            <QuizStatsHeader m={m}/>
            <Button onClick={advance}>Next</Button>
        </CardActions>
    </Card>
}