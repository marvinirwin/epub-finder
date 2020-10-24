import {Manager} from "../../lib/Manager";
import React from "react";
import {Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {dueDate, wordCount} from "../../lib/ReactiveClasses/ScheduleRow";
import moment from "moment";

export default function QuizStatsHeader({m}: { m: Manager }) {
    const newCards = useObservableState(m.scheduleManager.newCards$, []);
    const learningCards = useObservableState(m.scheduleManager.learningCards$, []);
    const toReviewCards = useObservableState(m.scheduleManager.toReviewCards$, []);
    const scheduledCards = useObservableState(m.scheduleManager.wordQuizList$, []);

    return <div style={{zIndex: 10, backgroundColor: 'white'}}>
        <Typography variant="subtitle1">
            <ul>
                {
                    scheduledCards.map(scheduledWord => <li className={"quiz-list"} key={scheduledWord.word}>
                            {scheduledWord.word} {scheduledWord.sortString}
                        </li>
                    )
                }
            </ul>
        </Typography>
    </div>
}