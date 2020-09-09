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
import {BrowserInputs} from "../../lib/Manager/BrowserInputs";
import {GetWorkerResults} from "../../lib/Util/GetWorkerResults";
import {isEqual, uniq} from "lodash";
import {AtomizedSentence} from "../../lib/Atomized/AtomizedSentence";
import {OpenBooks} from "../../lib/Manager/OpenBooks";
import {RecordRequest} from "../../lib/Interfaces/RecordRequest";
import GridListTile from "@material-ui/core/GridListTile";


export function Characters({c, m}: QuizCardProps) {
    const classes = quizStyles();
    const [error, setError] = useState('');
    const [createdSentence, setCreatedSentence] = useState();
    const advance = () => {
        m.quizManager.quizzingComponent$.next("Conclusion");
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
            <div>
                <QuizStatsHeader m={m}/>
            </div>
            <div style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between', height: '100%'}}>
                <Typography variant="h1" component="h1" className={classes.center}>
                    {c?.learningLanguage}
                </Typography>
                {c?.photos[0] && <img src={c?.photos[0]} style={{height: '100%', width: 'auto'}}/>}
            </div>
            <div>
                <Button onClick={advance}>Next</Button>
            </div>
        </CardContent>
{/*
        <CardActions className={classes.cardActions}>
        </CardActions>
*/}
    </Card>
}