import React, {useContext} from "react";
import {Button, Paper, Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {OpenDocumentComponent} from "../../lib/Atomized/open-document.component";
import {QuizCard} from "./quiz-card.interface";
import {ManagerContext} from "../../App";
import {PaperProps} from "@material-ui/core/Paper/Paper";
import {QuizCardKnownLanguage} from "./quiz-card-known-language.component";
import {QuizCardImage} from "./quiz-card-image.component";

export const QuizCardComponent: React.FC<{ quizCard: QuizCard } & PaperProps> = ({quizCard, ...props}) => {
    const word = useObservableState(quizCard.word$);
    const m = useContext(ManagerContext);
    return <Paper className='quiz-card' {...props}>
        <QuizCardImage quizCard={quizCard}/>
        <Typography variant={'h1'} className={'quiz-text'}>{word || ''}</Typography>
        <OpenDocumentComponent openedDocument={quizCard.exampleSentenceOpenDocument}/>
        <div className={'quiz-button-row'}>
            <Button
                className={'quiz-button-hard'}
                onClick={() => m.hotkeyEvents.quizResultHard$.next()}>
                Hard
            </Button>
            <Button
                className={'quiz-button-medium'}
                onClick={() => m.hotkeyEvents.quizResultMedium$.next()}>
                Medium
            </Button>
            <Button
                className={'quiz-button-easy'}
                onClick={() => m.hotkeyEvents.quizResultEasy$.next()}
            >
                Easy
            </Button>
            <Button
                className={'quiz-button-hide'}
                onClick={() => {
                    word && m.cardService.deleteWords.next([word])
                }}>
                Ignore
            </Button>
        </div>
    </Paper>
}