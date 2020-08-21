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
import {BookFrame} from "../../lib/BookFrame/BookFrame";
import {FrameContainer} from "../Frame/FrameContainer";
import {InputManager} from "../../lib/Manager/InputManager";
import {GetWorkerResults} from "../../lib/Util/GetWorkerResults";
import {isEqual, uniq} from "lodash";
import {AtomizedSentence} from "../../lib/Atomized/AtomizedSentence";
import {BookFrameManager} from "../../lib/Manager/BookFrameManager";
import {RecordRequest} from "../../lib/Interfaces/RecordRequest";


export function Characters({c, m}: QuizCardProps) {
    const classes = quizStyles();
    const [error, setError] = useState('');
    const [createdSentence, setCreatedSentence] = useState();
    const advance = () => {
        if (createdSentence) {
            m.quizManager.quizzingComponent$.next("Pictures");
        } else {
            const r = new RecordRequest(`Please record sentence with the word ${c?.learningLanguage}`);
            r.sentence.then(setCreatedSentence)
        }
    };

    /*
        const bookFrame$ = useObservableState(useObservable((obs$: Observable<[string[]]>) =>
            obs$.pipe(
                filter(([strings]) => strings.length > 0),
                map(([sentences]) => {
                    sentences = sentences.slice(0, 10);
                    return getSrc(sentences);
                }),
                switchMap(async (src: string) => {
                    const atomizedSrc = await GetWorkerResults(new AtomizeSrcdoc(), src);
                })
            ), [sentences$])
        );
    */

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
                    m.quizCharacterManager.bookFrame
                    && <FrameContainer rb={m.quizCharacterManager.bookFrame} m={m}/>
                }
            </div>
        </CardContent>
        <CardActions className={classes.cardActions}>
            <QuizStatsHeader m={m}/>
            <Button onClick={advance}>Next</Button>
        </CardActions>
    </Card>
}