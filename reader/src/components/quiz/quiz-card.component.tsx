import React, { Fragment, useContext } from 'react'
import { Paper } from '@material-ui/core'
import { useObservableState } from 'observable-hooks'
import { QuizCard } from './word-card.interface'
import { ManagerContext } from '../../App'
import { PaperProps } from '@material-ui/core/Paper/Paper'
import { QuizCardButtons } from './quiz-card-buttons.component'
import { allScheduleRowsForWordToday } from '../../lib/manager/sorted-limit-schedule-rows.service'
import { useScheduleInfo } from './todays-quiz-stats.component'
import { NoScheduleRows } from './no-schedule-rows.component'
import { RevealedQuizCard } from './card-types/revealed-quiz-card.component'
import { UnRevealedQuizCardComponent } from './card-types/un-revealed-quiz-card.component'


export const useActiveFlashCardTypes = () => {
    const m = useContext(ManagerContext)
    return useObservableState(m.flashCardTypesRequiredToProgressService.activeFlashCardTypes$) || []
}

export const QuizCardComponent: React.FC<{ quizCard: QuizCard } & PaperProps> = ({ quizCard, ...props }) => {
    const m = useContext(ManagerContext)
/*
    const scheduleInfo = useScheduleInfo()
*/
/*
    const cardLimit = useObservableState(m.settingsService.newQuizWordLimit$) || 0
*/
    const limitedScheduleRowData = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$)
/*
    const allScheduleRows = useObservableState(m.quizCardScheduleRowsService.scheduleRows$) || []
*/
/*
    const wordsLearnedToday = Object.values(allScheduleRowsForWordToday({
        allScheduleRows,
        scheduleRows: scheduleInfo.wordsLearnedToday,
    }))
*/
    const noScheduleRows = limitedScheduleRowData?.limitedScheduleRows?.length === 0;
    const answerIsRevealed = useObservableState(quizCard.answerIsRevealed$);
    const cardLimitReached = limitedScheduleRowData?.scheduleRowsLeftForToday?.length === 0 &&
        noScheduleRows;
    const showNoScheduleRows = noScheduleRows || cardLimitReached
return (
        <Paper className='quiz-card' {...props}>
            {
                showNoScheduleRows && <NoScheduleRows />
            }
            {
                !showNoScheduleRows && (
                    <Fragment>
                        {
                            answerIsRevealed ?
                                <RevealedQuizCard quizCard={quizCard} /> :
                                <UnRevealedQuizCardComponent quizCard={quizCard} />
                        }
                        <QuizCardButtons quizCard={quizCard} />
                    </Fragment>
                )
            }
        </Paper>
    )
}
