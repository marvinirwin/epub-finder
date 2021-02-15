import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {QuizCard} from "../../components/quiz/quiz-card.interface";

export const QuizCardProgress= ({quizCard}: {quizCard: QuizCard}) => {
    const m = useContext(ManagerContext);
    return <div>
    </div>
}