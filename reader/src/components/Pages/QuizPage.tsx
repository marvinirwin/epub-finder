import {Manager} from "../../lib/Manager";
import React, {Fragment} from "react";
import {Conclusion} from "../Quiz/Conclusion";
import {Pictures} from "../Quiz/Pictures";
import {Characters} from "../Quiz/Characters";
import {useObservableState} from "observable-hooks";
import {QuizCardProps} from "../Quiz/Popup";
import {SlidingTopWindows} from "./ReadingPage";

const componentMap: { [key: string]: React.FunctionComponent<QuizCardProps> } = {
    Conclusion: Conclusion,
    Pictures: Pictures,
    Characters: Characters
}

export function QuizPage({m}: { m: Manager }) {
    const quizStage = useObservableState(m.quizManager.quizStage);
    const quizzingCard = useObservableState(m.quizManager.quizzingCard$);

    return <Fragment>
        <SlidingTopWindows m={m}/>
        <div style={{height: '100%', position: 'relative', width: '100%'}}>
            <div style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
            }}>
                {quizStage === "Conclusion" && <Conclusion c={quizzingCard} m={m}/>}
                {(quizStage === "Characters" || !quizStage) && <Characters c={quizzingCard} m={m}/>}
            </div>
        </div>
    </Fragment>
}