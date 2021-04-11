import { ManagerContext } from '../../App'
import React, { useContext } from 'react'
import { QuizCard } from '../../components/quiz/word-card.interface'
import { useObservableState } from 'observable-hooks'
import { SortQuizData, ScheduleRow } from './schedule-row'
import { QuizCardScheduleRowDisplay } from './quiz-card-schedule-row.component'

export const CardInfo = ({ quizCard }: { quizCard: QuizCard }) => {
    const m = useContext(ManagerContext)
    const scheduleRow:
        | ScheduleRow<SortQuizData>
        | undefined = useObservableState(m.quizService.currentScheduleRow$)
    return (
        <div>
            {scheduleRow && (
                <QuizCardScheduleRowDisplay
                    quizCard={quizCard}
                />
            )}
        </div>
    )
}
