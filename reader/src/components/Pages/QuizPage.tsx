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
    const c = useObservableState(m.quizManager.quizzingComponent$);
    const quizzingCard = useObservableState(m.quizManager.quizzingCard$);

    return <Fragment>
        <SlidingTopWindows m={m}/>
        <div style={{height: '100%', position: 'relative', width: '100%'}}>
            <div style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
            }}>
                {c === "Conclusion" && <Conclusion c={quizzingCard} m={m}/>}
                {c === "Characters" || !c && <Characters c={quizzingCard} m={m}/>}
            </div>
        </div>
    </Fragment>
}