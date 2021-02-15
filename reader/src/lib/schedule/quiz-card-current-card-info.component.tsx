import {ManagerContext} from "../../App";
import React, {useContext} from "react";
import {QuizCard} from "../../components/quiz/quiz-card.interface";
import {useObservableState} from "observable-hooks";
import {NormalizedScheduleRowData, SortValue} from "./schedule-row.interface";
import {ScheduleRow} from "./ScheduleRow";
import humanizeDuration from 'humanize-duration';
import {DEV} from "../../components/directory/app-directory-service";


export const QuizCardCurrentCardInfo = ({quizCard}: { quizCard: QuizCard }) => {
    const m = useContext(ManagerContext);
    const w = useObservableState(quizCard.word$) || '';
    const scheduleRow: ScheduleRow<NormalizedScheduleRowData> | undefined = useObservableState(m.quizService.currentScheduleRow$);
    return <div>
        {
            scheduleRow &&
            <ScheduleRowDisplay scheduleRow={scheduleRow}/>
        }
    </div>
}
const ScheduleRowDisplay = ({scheduleRow}: { scheduleRow: ScheduleRow<NormalizedScheduleRowData> }) => {
    return <div>
        <div style={{marginTop: '24px'}}>
            Due in: {scheduleRow.dueIn()}
            {DEV && <DisplaySortValue sortValue={scheduleRow.d.dueDate}/>}
        </div>
        <div style={{marginTop: '24px'}}>
            Frequency: {scheduleRow.count()}
            {DEV && <DisplaySortValue sortValue={scheduleRow.d.count}/>}
        </div>
    </div>
}
const DisplaySortValue = ({sortValue}: { sortValue: SortValue<any> }) => {
    return <div style={{marginLeft: '24px'}}>
        <div>Normal: {sortValue.normalValue}</div>
        <div>Inverse Log: {sortValue.inverseLogNormalValue}</div>
        <div>Weighted Inverse Log: {sortValue.weightedInverseLogNormalValue}</div>
        <div>Weight: {sortValue.weight}</div>
    </div>
}

