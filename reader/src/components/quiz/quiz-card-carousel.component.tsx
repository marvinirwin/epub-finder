import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {QuizCardComponent} from "./quiz-card.component";

export const QuizCardCarousel = () => {
    const m = useContext(ManagerContext);
    const quizCard = m.quizService.quizCard;
    return <QuizCardComponent quizCard={quizCard} id={'current-quiz-card'}/>
}