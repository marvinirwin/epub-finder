import {Manager} from "../../lib/Manager";
import {useObs} from "../../lib/UseObs";
import React from "react";

export function QuizPage({m}: { m: Manager }) {
    const nextItem = useObs(m.quizManager.currentQuizItem$);
    return <div>
        TODO IMPLEMENT
    </div>
}