import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { Typography } from '@material-ui/core'
import { noMoreQuizCards } from '@shared/'

export const QuizCardLimitReached = () => {
    const m = useContext(ManagerContext)
    const limit = useObservableState(m.settingsService.newQuizWordLimit$) || 0
    const cardsDoneToday =
        useObservableState(m.quizCardScheduleService.cardsLearnedToday$)
            ?.length || 0
    return (
        <Typography className={noMoreQuizCards} variant="h3">
            Quiz Card Limit {cardsDoneToday} / {limit} reached
        </Typography>
    )
}
