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
import {HotkeyWrapper} from "../hotkey-wrapper";
import {NormalizedScheduleRowData, ScheduleRow} from "../../lib/schedule/schedule-row";

export const QuizCardButtons: React.FC<{ quizCard: QuizCard }> = ({quizCard}) => {
    const m = useContext(ManagerContext);
    const word = useObservableState((quizCard.word$));
    const answerIsRevealed = useObservableState(quizCard.answerIsRevealed$);
    const rowInfo = useObservableState(m.sortedLimitScheduleRowsService.sortedLimitedScheduleRows$) || {
        wordsToReview: [],
        limitedScheduleRows: [],
        wordsLearnedToday: [],
        wordsReviewingOrLearning: [],
        wordsWhichHaventBeenStarted: [],
    };
    const dailyLimit = useObservableState(m.settingsService.newQuizWordLimit$) || 0
    useSubscription(
        m.hotkeyEvents.advanceQuiz$,
        () => quizCard.answerIsRevealed$.next(true))
    return <div className={'quiz-button-row'}>
        {answerIsRevealed ?
            <Fragment>
                <HotkeyWrapper action={"QUIZ_RESULT_HARD"}>
                    <Button
                        className={QUIZ_BUTTON_HARD}
                        onClick={() => m.hotkeyEvents.quizResultHard$.next()}>
                        Hard
                    </Button>
                </HotkeyWrapper>
                <HotkeyWrapper action={"QUIZ_RESULT_MEDIUM"}>
                    <Button
                        className={QUIZ_BUTTON_MEDIUM}
                        onClick={() => m.hotkeyEvents.quizResultMedium$.next()}>
                        Medium
                    </Button>
                </HotkeyWrapper>
                <HotkeyWrapper action={"QUIZ_RESULT_EASY"}> <Button
                    className={QUIZ_BUTTON_EASY}
                    onClick={() => m.hotkeyEvents.quizResultEasy$.next()}
                >
                    Easy
                </Button>
                </HotkeyWrapper>
                <Button
                    className={QUIZ_BUTTON_IGNORE}
                    onClick={() => {
                        if (word) {
                            m.ignoredWordsRepository.addRecords$.next([{word, timestamp: new Date()}])
                        }
                    }}>
                    Ignore
                </Button>
            </Fragment> :
            <div>
                <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', margin: '24px'}}>
                    <Typography>
                        To Review: <span className={quizToReviewNumber}>{rowInfo.wordsToReview.length}</span>
                    </Typography>
                    <Typography>
                        Learning: <span className={quizLearningNumber}>{rowInfo.wordsReviewingOrLearning.length}</span>
                    </Typography>
                    <Typography>
                        Unstarted: <span className={quizUnlearnedNumber}>{(rowInfo.wordsWhichHaventBeenStarted.length || 0)}</span>
                    </Typography>
                    <Typography>
                        Left Today: <span className={leftTodayNumber}>{dailyLimit - (rowInfo.wordsLearnedToday.length || 0)}</span>
                    </Typography>
                </div>
                <div>
                    <HotkeyWrapper action={"ADVANCE_QUIZ"}>
                        <Button
                            id={quizButtonReveal}
                            onClick={() => m.hotkeyEvents.advanceQuiz$.next()}>
                            Reveal
                        </Button>
                    </HotkeyWrapper>
                </div>
            </div>

        }
    </div>
}