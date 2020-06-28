import {Manager} from "../../lib/Manager";
import {useObs} from "../../lib/Worker/UseObs";
import React from "react";

export function QuizPage({m}: { m: Manager }) {
    const nextItem = useObs(m.nextQuizItem$);
    return <div>
        TODO IMPLEMENT
    </div>
}