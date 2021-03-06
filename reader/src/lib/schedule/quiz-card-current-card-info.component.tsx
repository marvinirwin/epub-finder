import {ManagerContext} from "../../App";
import React, {useContext} from "react";
import {QuizCard} from "../../components/quiz/quiz-card.interface";
import {useObservableState} from "observable-hooks";
import {NormalizedScheduleRowData} from "./schedule-row.interface";
import {ScheduleRow} from "./ScheduleRow";
import {QuizCardScheduleRowDisplay} from "./quiz-card-schedule-row.component";


export const QuizCardCurrentCardInfo = ({quizCard}: { quizCard: QuizCard }) => {
    const m = useContext(ManagerContext);
    const scheduleRow: ScheduleRow<NormalizedScheduleRowData> | undefined = useObservableState(m.quizService.currentScheduleRow$);
    return <div>
        {
            scheduleRow &&
            <QuizCardScheduleRowDisplay scheduleRow={scheduleRow} quizCard={quizCard}/>
        }
    </div>
}

