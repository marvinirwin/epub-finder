import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { Typography } from '@material-ui/core'
import { cardLimitReached, outOfWords } from '@shared/'
import { groupBy } from 'lodash'

export const QuizCardLimitReached = () => {
    const m = useContext(ManagerContext)
    const limit = useObservableState(m.settingsService.newQuizWordLimit$) || 0
    const completedScheduleRows = useObservableState(m.quizCardScheduleService.cardsLearnedToday$) || [];
    const wordsDoneToday = Object.values(groupBy(completedScheduleRows, r => r.d.word))
            ?.length || 0
    return (
        <Typography className={cardLimitReached} variant="h3">
            Word Limit {wordsDoneToday} / {limit} reached
        </Typography>
    )
}

export const QuizCardOutOfWords = () => {
    return <Typography className={outOfWords} variant="h3">
        No more words to review, try adding more learning material
    </Typography>
}