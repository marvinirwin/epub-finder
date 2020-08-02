import {Manager} from "../../lib/Manager";
import {useObs} from "../../lib/UseObs";
import React from "react";

export function QuizPage({m}: { m: Manager }) {
    const Component = useObs(m.quizManager.quizzingComponent$);
    const quizzingCard = useObs(m.quizManager.quizzingCard$);
    return <div style={{height: '100%'}}>
        {Component && quizzingCard ? <Component c={quizzingCard} m={m}/> : ''}
    </div>
}