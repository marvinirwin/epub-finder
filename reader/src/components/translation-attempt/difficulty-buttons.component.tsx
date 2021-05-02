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
import { useTutorialPopOver } from '../tutorial-popover/tutorial-popper.component'

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
    const flash_card_type = useObservableState(quizCard.flashCardType$)

    const useQuizResult = (
        hotkeyObservable$: Observable<unknown>,
        score: SuperMemoGrade,
    ) => {
        useSubscription(hotkeyObservable$.pipe(), async () => {
            if (word && latestLanguageCode && flash_card_type) {
                m.quizResultService.completeQuiz(word, latestLanguageCode, score, flash_card_type)
            }
        })
    }
    useQuizResult(m.hotkeyEvents.quizResultEasy$, 5);
    const [easyRef, EasyTutorialPopOver] = useTutorialPopOver(
        'EasyButton',
        'If you recalled the answer easily'
    )
    useQuizResult(m.hotkeyEvents.quizResultMedium$, 3)
    const [mediumRef, MediumTutorialPopOver] = useTutorialPopOver(
        'MediumButton',
        'If you recalled the answer with some difficulty'
    )
    useQuizResult(m.hotkeyEvents.quizResultHard$, 1)
    const [hardRef, HardTutorialPopOver] = useTutorialPopOver(
        'HardButton',
        'If you could not recall the answer'
    );
    const [ignoreRef, IgnoreTutorialPopOver] = useTutorialPopOver(
        'IgnoreButton',
        `If you don't want to review this word`
    );
    useSubscription(m.hotkeyEvents.quizResultIgnore$, () => {
        if (word) {
            m.ignoredWordsRepository.addRecords$.next([
                { word, created_at: new Date() },
            ])
        }
    })
    return (
        <Fragment>
            <HotkeyWrapper action={'QUIZ_RESULT_HARD'}>
                <Button
                    ref={hardRef}
                    className={QUIZ_BUTTON_HARD}
                    onClick={() => m.hotkeyEvents.quizResultHard$.next()}
                >
                    Hard ({hardDueDateDistance})
                </Button>
                <HardTutorialPopOver/>
            </HotkeyWrapper>
            <HotkeyWrapper action={'QUIZ_RESULT_MEDIUM'}>
                <Button
                    className={QUIZ_BUTTON_MEDIUM}
                    onClick={() => m.hotkeyEvents.quizResultMedium$.next()}
                    ref={mediumRef}
                >
                    Medium ({mediumDueDateDistance})
                </Button>
                <MediumTutorialPopOver/>
            </HotkeyWrapper>
            <HotkeyWrapper action={'QUIZ_RESULT_EASY'}>
                {' '}
                <Button
                    className={QUIZ_BUTTON_EASY}
                    onClick={() => m.hotkeyEvents.quizResultEasy$.next()}
                    ref={easyRef}
                >
                    Easy ({easyDueDateDistance})
                </Button>
                <EasyTutorialPopOver/>
            </HotkeyWrapper>
            <HotkeyWrapper action={'QUIZ_RESULT_IGNORE'}>
                <Button
                    ref={ignoreRef}
                    className={QUIZ_BUTTON_IGNORE}
                    onClick={() => {
                        m.hotkeyEvents.quizResultIgnore$.next()
                    }}
                >
                    Ignore
                </Button>
                <IgnoreTutorialPopOver/>
            </HotkeyWrapper>
        </Fragment>
    )
}
