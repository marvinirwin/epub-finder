import {Button, Paper} from "@material-ui/core";
import {QUIZ_BUTTON_EASY, QUIZ_BUTTON_HARD, QUIZ_BUTTON_IGNORE, QUIZ_BUTTON_MEDIUM, quizButtonReveal} from "@shared/";
import React, {useContext, Fragment} from "react";
import {ManagerContext} from "../../App";
import {QuizCard} from "./quiz-card.interface";
import {useObservableState, useSubscription} from "observable-hooks";
import {HotkeyWrapper} from "../hotkey-wrapper";

export const QuizCardButtons: React.FC<{ quizCard: QuizCard }> = ({quizCard}) => {
    const m = useContext(ManagerContext);
    const word = useObservableState((quizCard.word$));
    const answerIsRevealed = useObservableState(quizCard.answerIsRevealed$);
    useSubscription(m.hotkeyEvents.advanceQuiz$, () => quizCard.answerIsRevealed$.next(true))
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
                            m.ignoredWordsRepository.addRecords$.next([{word, timestamp: new Date()}])
                        }
                    }}>
                    Ignore
                </Button>
            </Fragment> :
            <Fragment>
                <Button
                    id={quizButtonReveal}
                    onClick={() => m.hotkeyEvents.advanceQuiz$.next()}>
                    Reveal (Space)
                </Button>
            </Fragment>
        }
    </div>
}