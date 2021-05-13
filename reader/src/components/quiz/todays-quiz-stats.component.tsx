import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { Box, Typography } from '@material-ui/core'
import { quizLearnedTodayNumber, quizLearningNumber, quizToReviewNumber, quizWordsLeftForTodayNumber } from '@shared/'
import { allScheduleRowsForWord, anyScheduleRowsForWord } from '../../lib/manager/sorted-limit-schedule-rows.service'
import { WrapInContext } from './wrap-in-menu'

export const useScheduleInfo = () => {
    const m = useContext(ManagerContext)
    return useObservableState(
        m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$,
    ) || {
        wordsToReview: [],
        limitedScheduleRows: [],
        wordsLearnedToday: [],
        wordsReviewingOrLearning: [],
        wordsLeftForToday: [],
    }
}

export const TodaysQuizStats = () => {
    const m = useContext(ManagerContext)
    const flashCardTypes = useObservableState(m.flashCardTypesRequiredToProgressService.activeFlashCardTypes$) || []
    const scheduleInfo = useScheduleInfo()
    const learnedToday = allScheduleRowsForWord(scheduleInfo.wordsLearnedToday, flashCardTypes)
    const wordsToReview = allScheduleRowsForWord(scheduleInfo.wordsToReview, flashCardTypes)
    const wordsReviewingOrLearning = anyScheduleRowsForWord(scheduleInfo.wordsReviewingOrLearning, flashCardTypes)
    const wordsLeft = allScheduleRowsForWord(scheduleInfo.wordsLeftForToday, flashCardTypes)
    return <Box m={2} p={1} className={'quiz-button-row'}>
        <WrapInContext items={wordsLeft.map(([r]) => r.d.word)} onClick={v => m.wordCardModalService.word$.next(v)}>
            <Typography variant={'subtitle1'}>
                New Words Left for Today:{' '}
                <span className={quizWordsLeftForTodayNumber}>
                                {wordsLeft.length}
                            </span>
            </Typography>
        </WrapInContext>
        <WrapInContext items={wordsReviewingOrLearning.map(([r]) => r.d.word)}
                       onClick={v => m.wordCardModalService.word$.next(v)}>
            <Typography variant={'subtitle1'}>
                Being Learned:{' '}
                <span className={quizLearningNumber}>
                                {wordsReviewingOrLearning.length}
                            </span>
            </Typography>
        </WrapInContext>
        <WrapInContext items={wordsToReview.map(([r]) => r.d.word)} onClick={v => m.wordCardModalService.word$.next(v)}>
            <Typography variant={'subtitle1'}>
                To Review:{' '}
                <span className={quizToReviewNumber}>
                                {wordsToReview.length}
                            </span>
            </Typography>
        </WrapInContext>
        <WrapInContext items={learnedToday.map(([r]) => r.d.word)} onClick={v => m.wordCardModalService.word$.next(v)}>
            <Typography variant={'subtitle1'}>
                Learned Today:{' '}
                <span
                    className={quizLearnedTodayNumber}>{learnedToday.length}</span>
            </Typography>
        </WrapInContext>
    </Box>
}