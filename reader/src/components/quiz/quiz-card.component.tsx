import React, {useContext} from "react";
import {Button, Paper, Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {OpenedDocument} from "../../lib/Atomized/OpenedDocument";
import {QuizCard} from "./quiz-card.interface";
import {EditableOnClick} from "./editable-image.component";
import {ManagerContext} from "../../App";
import {PaperProps} from "@material-ui/core/Paper/Paper";

export const QuizCardComponent: React.FC<{c: QuizCard} & PaperProps> = ({c, ...props}) => {
    const word = useObservableState(c.word$);
    const source = useObservableState(c.image$.value$);
    const m = useContext(ManagerContext);
    return <Paper className='quiz-card' {...props}>
        <EditableOnClick onEditClicked={() => {
            // TODO image search
        }}>
            <img src={source}/>
        </EditableOnClick>
        <EditableOnClick onEditClicked={() => {
            // TODO image search
        }}>
            <Typography> {word || ''} </Typography>
        </EditableOnClick>
        <OpenedDocument openedDocument={c.exampleSentenceOpenDocument} />
        <div className={'quiz-button-row'}>
            <Button className={'quiz-button-hard'} onClick={() => m.hotkeyEvents.quizResultHard$.next()}/>
            <Button className={'quiz-button-medium'} onClick={() => m.hotkeyEvents.quizResultMedium$.next()}/>
            <Button className={'quiz-button-easy'} onClick={() => m.hotkeyEvents.quizResultEasy$.next()}/>
            <Button className={'quiz-button-hide'} onClick={() => {}}>Hide</Button>
        </div>
    </Paper>
}