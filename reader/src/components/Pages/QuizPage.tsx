import {Manager} from "../../lib/Manager";
import React, {Fragment} from "react";
import {useObservableState} from "observable-hooks";
import {SlidingTopWindows} from "./ReadingPage";


export function QuizPage({m}: { m: Manager }) {
    const quizStage = useObservableState(m.quizManager.quizStage$);
    const quizzingCard = useObservableState(m.quizManager.quizzingCard$);

    return <Fragment>
        <SlidingTopWindows m={m}/>
    </Fragment>
}