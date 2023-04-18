import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { Box, Typography } from '@material-ui/core'
import { cardLimitReached, outOfWords } from '@shared/'
import { groupBy } from 'lodash'
import { SetQuizWordLimit } from '../settings/set-new-quiz-word-limit.component'

export const QuizCardLimitReached = () => {
    const m = useContext(ManagerContext)
    const limit = useObservableState(m.settingsService.newQuizWordLimit$.obs$) || 0
    const completedScheduleRows = useObservableState(m.quizCardScheduleService.cardsLearnedToday$) || [];
    const wordsDoneToday = Object.values(groupBy(completedScheduleRows, r => r.d.word))
            ?.length || 0
    return (
        <div style={{display: 'flex', flexFlow: 'column nowrap'}}>
            <Typography className={cardLimitReached} variant="h3">
                Word Limit: {limit} reached
            </Typography>
            <SetQuizWordLimit />
        </div>
    )
}

export const QuizCardOutOfWords = () => {
    return <Typography className={outOfWords} variant="h3">
        No more words to review, try adding more learning material
    </Typography>
}