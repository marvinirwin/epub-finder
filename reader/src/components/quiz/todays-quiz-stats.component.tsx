import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { Box, Typography } from '@material-ui/core'
import { quizLearnedTodayNumber, quizLearningNumber, quizToReviewNumber, quizWordsLeftForTodayNumber } from '@shared/'
import { allScheduleRowsForWord, anyScheduleRowsForWord } from '../../lib/manager/sorted-limit-schedule-rows.service'

export const TodaysQuizStats = () => {
    const m = useContext(ManagerContext)
    const flashCardTypes = useObservableState(m.settingsService.flashCardTypesRequiredToProgress$) || []
    const scheduleInfo = useObservableState(
        m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$,
    ) || {
        wordsToReview: [],
        limitedScheduleRows: [],
        wordsLearnedToday: [],
        wordsReviewingOrLearning: [],
        wordsLeftForToday: [],
    }
    return <Box m={2} p={1} className={'quiz-button-row'}>
        <Typography variant={'h6'}>
            New Words Left for Today:{' '}
            <span className={quizWordsLeftForTodayNumber}>
                                {allScheduleRowsForWord(scheduleInfo.wordsLeftForToday, flashCardTypes).length}
                            </span>
        </Typography>
        <Typography variant={'h6'}>
            Being Learned:{' '}
            <span className={quizLearningNumber}>
                                {anyScheduleRowsForWord(scheduleInfo.wordsReviewingOrLearning, flashCardTypes).length}
                            </span>
        </Typography>
        <Typography variant={'h6'}>
            To Review:{' '}
            <span className={quizToReviewNumber}>
                                {allScheduleRowsForWord(scheduleInfo.wordsToReview, flashCardTypes).length}
                            </span>
        </Typography>
        <Typography variant={'h6'}>
            Learned Today:{' '}
            <span
                className={quizLearnedTodayNumber}>{allScheduleRowsForWord(scheduleInfo.wordsLearnedToday, flashCardTypes).length}</span>
        </Typography>
    </Box>
}