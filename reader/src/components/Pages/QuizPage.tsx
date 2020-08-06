import {Manager} from "../../lib/Manager";
import {useObs} from "../../lib/UseObs";
import React from "react";
import {Conclusion} from "../Quiz/Conclusion";
import {Pictures} from "../Quiz/Pictures";
import {Characters} from "../Quiz/Characters";
import {useObservableState} from "observable-hooks";
import {QuizComponent} from "../../lib/Manager/QuizManager";
import {Dictionary} from "lodash";
import {QuizCardProps} from "../Quiz/Popup";

const componentMap: { [key: string]: React.FunctionComponent<QuizCardProps> } = {
    Conclusion: Conclusion,
    Pictures: Pictures,
    Characters: Characters
}

export function QuizPage({m}: { m: Manager }) {
    const c = useObservableState(m.quizManager.quizzingComponent$);
    const quizzingCard = useObservableState(m.quizManager.quizzingCard$);
    const currentComponent = componentMap[c || ''] || Characters;

    return <div style={{height: '100%', position: 'relative', width: '100%'}}>
        {Object.values(componentMap).map(Component =>
            <div key={Component.name} style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: currentComponent === Component ? '0' : '9000px'
            }
            }>
                <Component c={quizzingCard} m={m}/>
            </div>
        )}
    </div>
}