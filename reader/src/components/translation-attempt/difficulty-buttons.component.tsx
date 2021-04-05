import React, { Fragment, useContext } from 'react'
import { ManagerContext } from '../../App'
import { HotkeyWrapper } from '../hotkeys/hotkey-wrapper'
import { Button } from '@material-ui/core'
import { QUIZ_BUTTON_EASY, QUIZ_BUTTON_HARD, QUIZ_BUTTON_IGNORE, QUIZ_BUTTON_MEDIUM } from '@shared/'
import { ScheduleItem } from '../../lib/schedule/schedule-row'
import { quizCardNextDueDate } from '../../lib/srm/srm.service'
import { formatDistance } from 'date-fns'

export const DifficultyButtons: React.FC<{ previousScheduleItems: ScheduleItem[] }> = ({ previousScheduleItems }) => {
    const m = useContext(ManagerContext)
    const now = new Date()
    const hardDueDateDistance = formatDistance(quizCardNextDueDate({
        previousItems: previousScheduleItems,
        grade: 1,
    }), Date.now())
    const mediumDueDateDistance = formatDistance(quizCardNextDueDate({
        previousItems: previousScheduleItems,
        grade: 3,
    }), Date.now())
    const easyDueDateDistance = formatDistance(quizCardNextDueDate({
        previousItems: previousScheduleItems,
        grade: 5,
    }), Date.now())
    return (
        <Fragment>
            <HotkeyWrapper action={'QUIZ_RESULT_HARD'}>
                <Button
                    className={QUIZ_BUTTON_HARD}
                    onClick={() => m.hotkeyEvents.quizResultHard$.next()}
                >
                    Hard ({hardDueDateDistance})
                </Button>
            </HotkeyWrapper>
            <HotkeyWrapper action={'QUIZ_RESULT_MEDIUM'}>
                <Button
                    className={QUIZ_BUTTON_MEDIUM}
                    onClick={() => m.hotkeyEvents.quizResultMedium$.next()}
                >
                    Medium ({mediumDueDateDistance})
                </Button>
            </HotkeyWrapper>
            <HotkeyWrapper action={'QUIZ_RESULT_EASY'}>
                {' '}
                <Button
                    className={QUIZ_BUTTON_EASY}
                    onClick={() => m.hotkeyEvents.quizResultEasy$.next()}
                >
                    Easy ({easyDueDateDistance})
                </Button>
            </HotkeyWrapper>
            <HotkeyWrapper action={'QUIZ_RESULT_IGNORE'}>
                <Button
                    className={QUIZ_BUTTON_IGNORE}
                    onClick={() => {
                        m.hotkeyEvents.quizResultIgnore$.next()
                    }}
                >
                    Ignore
                </Button>
            </HotkeyWrapper>
        </Fragment>
    )
}
