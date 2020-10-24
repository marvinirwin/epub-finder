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
import {isChineseCharacter} from "../../lib/Interfaces/OldAnkiClasses/Card";
import {lookupPinyin} from "../../lib/ReactiveClasses/EditingCard";
import {HotkeyWrapper} from "../HotkeyWrapper";
import {useSubscription} from "observable-hooks";
import {filterTextInputEvents} from "../../lib/Manager/BrowserInputs";
import {QuizComponent} from "../../lib/Manager/QuizManager";

const promptingRecordingRecordingFailed = 'prompting-recording recording-failed';
const promptingRecordingRecordingSuccess = 'prompting-recording recording-success';

export function Characters({c, m}: QuizCardProps) {
    const classes = quizStyles();
    const [error, setError] = useState('');
    const requestEditWord = () => c && m.editingCardManager.requestEditWord$.next(c.learningLanguage);
    const advance = () => {
        m.quizManager.quizStage$.next(QuizComponent.Conclusion);
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

    const [recordingClass, setRecordingClass] = useState<string>('');


    function tryAudio() {
        if (!c) return;
        let newRecordRequest = new RecordRequest(c.learningLanguage);
        newRecordRequest.recording$.subscribe(isRecording => {
            if (isRecording) {
                setRecordingClass('prompting-recording');
            }
        })
        newRecordRequest.sentence.then(sentence => {
            if (!c) return;
            if (sentence.includes(c.learningLanguage)) {
                setRecordingClass(promptingRecordingRecordingSuccess);
                setTimeout(() => {
                    advance();
                }, 250);
            } else {
                setRecordingClass(promptingRecordingRecordingFailed);
            }
        });
        m.audioManager.audioRecorder.recordRequest$.next(newRecordRequest);
    }

    // Subscribe to the keydown "r" while we can
    useSubscription(m.inputManager.getKeyDownSubject('r').pipe(filterTextInputEvents), e => {
        e.preventDefault()
        tryAudio();
    });
    useSubscription(m.inputManager.getKeyDownSubject('e').pipe(filterTextInputEvents), requestEditWord);

    return <Card style={{
        height: '25vh',
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
                    <HotkeyWrapper shortcutKey={'r'}>
                        <div className={`${recordingClass} quiz-character`} onClick={requestEditWord}>
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