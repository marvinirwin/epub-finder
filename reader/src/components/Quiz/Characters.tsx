/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import {Card} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import React, {useEffect, useState} from "react";
import {QuizCardProps} from "./Popup";
import {quizStyles} from "./QuizStyles";
import QuizStatsHeader from "./QuizStatsHeaders";
import {take} from "rxjs/operators";
import {RecordRequest} from "../../lib/Interfaces/RecordRequest";
import {HotkeyWrapper} from "../HotkeyWrapper";
import {useObservableState, useSubscription} from "observable-hooks";
import {filterTextInputEvents} from "../../lib/Manager/BrowserInputs";
import {Manager} from "../../lib/Manager";

export const promptingRecordingRecordingFailed = 'prompting-recording recording-failed';
export const promptingRecordingRecordingSuccess = 'prompting-recording recording-success';


export function Characters({c, m}: QuizCardProps) {
    const classes = quizStyles();

    function advance() {
        m.hotkeyEvents.advanceQuiz$.next();
    }

    useEffect(() => {
        if (!c?.learningLanguage) return;
        const r = new RecordRequest(`Please record sentence with the word ${c?.learningLanguage}`);
        r.sentence.then(async createdSentence => {
            if (!createdSentence) {
                return;
            }
            if (!createdSentence.includes(c.learningLanguage)) {
                console.log(`The synthesized sentence (${createdSentence}) does not contain ${c.learningLanguage}`)
            }
            const allPreviousCreatedSentence = await m.createdSentenceManager.allCreatedSentences$.pipe(
                take(1),
            ).toPromise();

            if (allPreviousCreatedSentence[createdSentence]) {
                console.log(`You have already said ${createdSentence}`)
            } else {
                console.log(`Sentence "${createdSentence}" recorded`);
                advance();
            }
        })
    }, [c?.learningLanguage]);

    const recordingClass = useObservableState(m.quizCharacterManager.recordingClass$, '');

    return <Card style={{
        height: '35vh',
        padding: 0,
        backgroundColor: 'white',
        display: 'flex'
    }}>
        <div style={{width: '25%', overflow: 'hidden'}}>
            <QuizStatsHeader m={m}/>
        </div>
        <div style={{width: '50%', display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between', height: '100%'}}>
            <div style={{display: 'flex', flexFlow: 'column nowrap', justifyContent: 'flex-end', width: '100%'}}>
{/*
                {
                    recordingClass === promptingRecordingRecordingFailed ? <HotkeyWrapper shortcutKey={'r'}>
                        <Button onClick={tryAudio}>retry</Button>
                    </HotkeyWrapper> : <div/>
                }
*/}
                <div style={{width: '100%', display: 'flex', flexFlow: 'row nowrap', justifyContent: 'center'}}>
                    <HotkeyWrapper action={"RECORD_QUIZ_WORD"}>
                        <div className={`${recordingClass} quiz-character`} onClick={
                            () => m.hotkeyEvents.requestEditQuizWord$.next()
                        }>
                            <Typography variant="h1" component="h1" className={classes.center}>
                                {c?.learningLanguage}
                            </Typography>
                        </div>
                    </HotkeyWrapper>
                </div>
            </div>
            {c?.photos[0] && <img src={c?.photos[0]} style={{height: '100%', width: 'auto'}}/>}
        </div>
{/*
        <div style={{width: '25%'}}>
            <Button onClick={advance}>Next</Button>
        </div>
*/}
    </Card>
}