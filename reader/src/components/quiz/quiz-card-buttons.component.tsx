import {Button, Paper, Typography} from "@material-ui/core";
import {
    leftTodayNumber,
    QUIZ_BUTTON_EASY,
    QUIZ_BUTTON_HARD,
    QUIZ_BUTTON_IGNORE,
    QUIZ_BUTTON_MEDIUM,
    quizButtonReveal,
    quizLearningNumber,
    quizToReviewNumber, quizUnlearnedNumber
} from "@shared/";
import React, {useContext, Fragment} from "react";
import {ManagerContext} from "../../App";
import {QuizCard} from "./word-card.interface";
import {useObservableState, useSubscription} from "observable-hooks";
import {HotkeyWrapper} from "../hotkeys/hotkey-wrapper";
import {DifficultyButtons} from "../translation-attempt/difficulty-buttons.component";


export const AdvanceButton = () => {
    const m = useContext(ManagerContext);
    return <HotkeyWrapper action={"ADVANCE_QUIZ"}>
        <Button
            id={quizButtonReveal}
            onClick={() => m.hotkeyEvents.advanceQuiz$.next()}>
            Reveal
        </Button>
    </HotkeyWrapper>
}

export const QuizCardButtons: React.FC<{ quizCard: QuizCard }> = ({quizCard}) => {
    const m = useContext(ManagerContext);
    const word = useObservableState((quizCard.word$));
    const answerIsRevealed = useObservableState(quizCard.answerIsRevealed$);
    const rowInfo = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$) || {
        wordsToReview: [],
        limitedScheduleRows: [],
        wordsLearnedToday: [],
        wordsReviewingOrLearning: [],
        wordsLeftForToday: [],
    };
    const dailyLimit = useObservableState(m.settingsService.newQuizWordLimit$) || 0
    useSubscription(
        m.hotkeyEvents.advanceQuiz$,
        () => quizCard.answerIsRevealed$.next(true))
    return <div className={'quiz-button-row'}>
        {answerIsRevealed ?
            <DifficultyButtons/> :
            <div>
                <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', margin: '24px'}}>
                    <Typography>
                        New Words Left for Today: <span
                        className={quizUnlearnedNumber}>{(rowInfo.wordsLeftForToday.length || 0)}</span>
                    </Typography>
                    <Typography>
                        Being Learned: <span
                        className={quizLearningNumber}>{rowInfo.wordsReviewingOrLearning.length}</span>
                    </Typography>
                    <Typography>
                        To Review: <span className={quizToReviewNumber}>{rowInfo.wordsToReview.length}</span>
                    </Typography>
                    <Typography>
                        Learned Today: <span>{rowInfo.wordsLearnedToday.length}</span>
                    </Typography>
                </div>
            </div>
        }
    </div>
}