import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {QuizCardComponent} from "./quiz-card.component";

export const QuizCardCarousel = () => {
    const m = useContext(ManagerContext);
    const c = m.quizCarouselService.quizCard;
    return <QuizCardComponent c={c}/>
}