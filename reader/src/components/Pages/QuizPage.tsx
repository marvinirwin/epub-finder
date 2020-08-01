import {Manager} from "../../lib/Manager";
import {useObs} from "../../lib/UseObs";
import React from "react";
import {DialogContent} from "@material-ui/core";

export function QuizPage({m}: { m: Manager }) {
    const Component = useObs(m.quizManager.currentQuizDialogComponent$);
    const quizzingCard = useObs(m.quizManager.currentQuizItem$);
    return <div>
        {Component && quizzingCard ? <Component c={quizzingCard} m={m}/> : ''}
    </div>
}