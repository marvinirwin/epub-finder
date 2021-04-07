import React, { Fragment, useContext } from 'react'
import { ManagerContext } from '../../App'
import { HotkeyWrapper } from '../hotkeys/hotkey-wrapper'
import { Button } from '@material-ui/core'
import { QUIZ_BUTTON_EASY, QUIZ_BUTTON_HARD, QUIZ_BUTTON_IGNORE, QUIZ_BUTTON_MEDIUM } from '@shared/'
import { ScheduleItem } from '../../lib/schedule/schedule-row'
import { quizCardNextDueDate } from '../../lib/srm/srm.service'
import { formatDistance } from 'date-fns'
import { useObservableState, useSubscription } from 'observable-hooks'
import { Observable } from 'rxjs'
import { SuperMemoGrade } from 'supermemo'
import { QuizCard } from '../quiz/word-card.interface'

export const DifficultyButtons: React.FC<{ previousScheduleItems: ScheduleItem[], quizCard: QuizCard}> = ({ previousScheduleItems, quizCard }) => {
    const m = useContext(ManagerContext)
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
    }), Date.now());

    const word = useObservableState(quizCard.word$)
    const latestLanguageCode = useObservableState(m.languageConfigsService.readingLanguageCode$)
    const flashCardType = useObservableState(quizCard.flashCardType$)

    const useQuizResult = (
        hotkeyObservable$: Observable<unknown>,
        score: SuperMemoGrade,
    ) => {
        useSubscription(hotkeyObservable$.pipe(), async () => {
            if (word && latestLanguageCode && flashCardType) {
                m.quizResultService.completeQuiz(word, latestLanguageCode, score, flashCardType)
            }
        })
    }
    useQuizResult(m.hotkeyEvents.quizResultEasy$, 5)
    useQuizResult(m.hotkeyEvents.quizResultMedium$, 3)
    useQuizResult(m.hotkeyEvents.quizResultHard$, 1)
    useSubscription(m.hotkeyEvents.quizResultIgnore$, () => {
        if (word) {
            m.ignoredWordsRepository.addRecords$.next([
                { word, timestamp: new Date() },
            ])
        }
    })
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
