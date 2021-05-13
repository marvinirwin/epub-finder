import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { Box, Button, Menu, MenuItem, Typography } from '@material-ui/core'
import { quizLearnedTodayNumber, quizLearningNumber, quizToReviewNumber, quizWordsLeftForTodayNumber } from '@shared/'
import { allScheduleRowsForWord, anyScheduleRowsForWord } from '../../lib/manager/sorted-limit-schedule-rows.service'
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state'

const WrapInContext: React.FC<{ items: string[], onClick: (v: string) => unknown, clickChild: React.FC<{}> }> = ({
                                                                                           children,
                                                                                           items,
                                                                                           onClick,
                                                                                       }) => {
    return <PopupState variant='popover' popupId='demo-popup-menu'>
        {(popupState) => (
            <React.Fragment>
                {children}
                <Button variant='contained' color='primary' {...bindTrigger(popupState)}>
                    {children}
                </Button>
                <Menu {...bindMenu(popupState)}>
                    {
                        items.map(item => <MenuItem key={item} onClick={() => {
                            popupState.close()
                            onClick(item)
                        }}>{item}</MenuItem>)
                    }
                </Menu>
            </React.Fragment>
        )}
    </PopupState>
}

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
        <Typography variant={'h6'}>
            New Words Left for Today:{' '}
            <span className={quizWordsLeftForTodayNumber}>
                                {wordsLeft.length}
                            </span>
        </Typography>
        <Typography variant={'h6'}>
            Being Learned:{' '}
            <span className={quizLearningNumber}>
                                {wordsReviewingOrLearning.length}
                            </span>
        </Typography>
        <Typography variant={'h6'}>
            To Review:{' '}
            <span className={quizToReviewNumber}>
                                {wordsToReview.length}
                            </span>
        </Typography>
        <Typography variant={'h6'}>
            Learned Today:{' '}
            <span
                className={quizLearnedTodayNumber}>{learnedToday.length}</span>
        </Typography>
    </Box>
}