import {Button, Paper} from "@material-ui/core";
import {QUIZ_BUTTON_EASY, QUIZ_BUTTON_HARD, QUIZ_BUTTON_IGNORE, QUIZ_BUTTON_MEDIUM} from "@shared/*";
import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {QuizCard} from "./quiz-card.interface";
import {useObservableState} from "observable-hooks";

export const QuizCardButtons: React.FC<{quizCard: QuizCard}> = ({quizCard}) => {
    const m = useContext(ManagerContext);
    const word = useObservableState((quizCard.word$));
    return <div className={'quiz-button-row'}>
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
                    m.ignoredWordsRepository.addRecords$.next([{word, timestamp: new Date()}])
                }
            }}>
            Ignore
        </Button>
    </div>
}