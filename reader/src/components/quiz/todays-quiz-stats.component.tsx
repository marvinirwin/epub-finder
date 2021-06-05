import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { Box, Typography } from '@material-ui/core'
import { quizLearnedTodayNumber, quizLearningNumber, quizToReviewNumber, quizWordsLeftForTodayNumber } from '@shared/'
import { WrapInContext } from './wrap-in-menu'
import { LimitedScheduleRows, SpacedScheduleRow } from '../../lib/manager/sorted-limit-schedule-rows.service'
import { isToday } from 'date-fns'

const WordCountInButton: React.FC<{ scheduleRows: SpacedScheduleRow[], className?: string }> = (
    {
        scheduleRows,
        className,
        children,
    }) => {
    const m = useContext(ManagerContext);
    return <WrapInContext items={scheduleRows.map(r => r.d.word)}
                          onClick={v => m.wordCardModalService.word$.next(v)}
    >
        <Typography variant={'subtitle1'}>
            {children}{' '}
            <span className={className}> {scheduleRows.length} </span>
        </Typography>
    </WrapInContext>
}

export const useScheduleInfo = (): LimitedScheduleRows => {
    const m = useContext(ManagerContext)
    return useObservableState(
        m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$,
    ) || {
        wordsToReview: [],
        limitedScheduleRows: [],
        wordsLearnedToday: [],
        wordsReviewedToday: [],
        wordsLearning: [],
        wordsLeftForToday: [],
        unStartedWords: [],
        debug: {
            limitedScheduleRows: {
                overDueRows: [],
                scheduleRowsLeftForToday: [],
                notOverDueRows: [],
            },
        },
    }
}

export const TodaysQuizStats = () => {
    const m = useContext(ManagerContext)
    const flashCardTypes = useObservableState(m.flashCardTypesRequiredToProgressService.activeFlashCardTypes$) || []
    const scheduleInfo = useScheduleInfo()
    const allScheduleRows = useObservableState(m.quizCardScheduleRowsService.scheduleRows$) || []
    /*
        const learnedToday = allScheduleRowsForWordToday({scheduleRows: scheduleInfo.wordsLearnedForTheFirstTimeToday, allScheduleRows})
        const reviewedToday = allScheduleRowsForWordToday({scheduleRows: scheduleInfo.wordsLearnedForTheFirstTimeToday, allScheduleRows})
        const wordsToReview = allScheduleRowsForWordToday({scheduleRows: scheduleInfo.wordsToReview, allScheduleRows})
        const wordsReviewingOrLearning = anyScheduleRowsForWord(scheduleInfo.wordsReviewingOrLearning, flashCardTypes)
        const wordsLeft = allScheduleRowsForWordToday({scheduleRows: scheduleInfo.wordsLeftForToday, allScheduleRows})
    */
    const scheduleRowsForToday = allScheduleRows.filter(row => isToday(row.dueDate()))
    return <Box m={2} p={1} className={'quiz-button-row'}>
        <WordCountInButton
            scheduleRows={scheduleInfo.wordsLeftForToday}
            className={quizWordsLeftForTodayNumber}>
            New Cards Left for Today:
        </WordCountInButton>
        <WordCountInButton
            scheduleRows={scheduleInfo.wordsLearning}
            className={quizLearningNumber}>
            Being Learned:
        </WordCountInButton>
        <WordCountInButton
            scheduleRows={scheduleInfo.wordsReviewedToday}
            className={quizToReviewNumber}>
            Reviewed Today:
        </WordCountInButton>
        <WordCountInButton
            scheduleRows={scheduleInfo.wordsToReview}
            className={quizToReviewNumber}>
            To Review:
        </WordCountInButton>
        <WordCountInButton
            scheduleRows={scheduleInfo.wordsLearnedToday}
            className={quizLearnedTodayNumber}>
            Learned Today:
        </WordCountInButton>
    </Box>
}