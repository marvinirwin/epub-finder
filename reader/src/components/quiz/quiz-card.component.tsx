import React, {useContext} from "react";
import {Button, Paper, Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {OpenedDocument} from "../../lib/Atomized/OpenedDocument";
import {QuizCard} from "./quiz-card.interface";
import {ManagerContext} from "../../App";
import {PaperProps} from "@material-ui/core/Paper/Paper";
import {QuizCardKnownLanguage} from "./quiz-card-known-language.component";
import {QuizCardImage} from "./quiz-card-image.component";

export const QuizCardComponent: React.FC<{c: QuizCard} & PaperProps> = ({c, ...props}) => {
    const word = useObservableState(c.word$);
    const m = useContext(ManagerContext);
    return <Paper className='quiz-card' {...props}>
        <Typography className={'quiz-text'}>{word || ''}</Typography>
        <QuizCardImage c={c} />
        <QuizCardKnownLanguage c={c} />
        <OpenedDocument openedDocument={c.exampleSentenceOpenDocument}/>
        <div className={'quiz-button-row'}>
            <Button className={'quiz-button-hard'} onClick={() => m.hotkeyEvents.quizResultHard$.next()}/>
            <Button className={'quiz-button-medium'} onClick={() => m.hotkeyEvents.quizResultMedium$.next()}/>
            <Button className={'quiz-button-easy'} onClick={() => m.hotkeyEvents.quizResultEasy$.next()}/>
            <Button className={'quiz-button-hide'} onClick={() => {
            }}>Hide</Button>
        </div>
    </Paper>
}