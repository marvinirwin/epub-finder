import React, {useContext} from "react";
import {Button, Paper, Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {OpenDocumentComponent} from "../../lib/Atomized/open-document.component";
import {QuizCard} from "./quiz-card.interface";
import {ManagerContext} from "../../App";
import {PaperProps} from "@material-ui/core/Paper/Paper";
import {QuizCardKnownLanguage} from "./quiz-card-known-language.component";
import {QuizCardImage} from "./quiz-card-image.component";

const QUIZ_BUTTON_HARD = 'quiz-button-hard';
const QUIZ_BUTTON_EASY = 'quiz-button-easy';
const QUIZ_BUTTON_IGNORE = 'quiz-button-hide';

export const QuizCardComponent: React.FC<{ quizCard: QuizCard } & PaperProps> = ({quizCard, ...props}) => {
    const word = useObservableState(quizCard.word$);
    const m = useContext(ManagerContext);
    const QUIZ_BUTTON_MEDIUM = 'quiz-button-medium';
    return <Paper className='quiz-card' {...props}>
        <QuizCardImage quizCard={quizCard}/>
        <Typography variant={'h1'} className={'quiz-text'}>{word || ''}</Typography>
        <OpenDocumentComponent openedDocument={quizCard.exampleSentenceOpenDocument}/>
        <div className={'quiz-button-row'}>
            <Button
                className={QUIZ_BUTTON_HARD}
                onClick={() => m.hotkeyEvents.quizResultHard$.next()}>
                Hard
            </Button>
            <Button
                className={QUIZ_BUTTON_MEDIUM}
                onClick={() => m.hotkeyEvents.quizResultMedium$.next()}>
                Medium
            </Button>
            <Button
                className={QUIZ_BUTTON_EASY}
                onClick={() => m.hotkeyEvents.quizResultEasy$.next()}
            >
                Easy
            </Button>
            <Button
                className={QUIZ_BUTTON_IGNORE}
                onClick={() => {
                    if (word) {
                        m.cardsRepository.deleteWords.next([word])
                    }
                }}>
                Ignore
            </Button>
        </div>
    </Paper>
}