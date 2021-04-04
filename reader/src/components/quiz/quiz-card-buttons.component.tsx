import { Button, Typography } from '@material-ui/core'
import { quizButtonReveal, quizLearningNumber, quizToReviewNumber, quizUnlearnedNumber } from '@shared/'
import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { QuizCard } from './word-card.interface'
import { useObservableState, useSubscription } from 'observable-hooks'
import { HotkeyWrapper } from '../hotkeys/hotkey-wrapper'
import { DifficultyButtons } from '../translation-attempt/difficulty-buttons.component'
import { WordRecognitionRow } from '../../lib/schedule/word-recognition-row'

export const AdvanceButton = () => {
    const m = useContext(ManagerContext)
    return (
        <HotkeyWrapper action={'ADVANCE_QUIZ'}>
            <Button
                id={quizButtonReveal}
                onClick={() => m.hotkeyEvents.advanceQuiz$.next()}
            >
                Reveal
            </Button>
        </HotkeyWrapper>
    )
}

export const QuizCardButtons: React.FC<{ quizCard: QuizCard }> = ({
                                                                      quizCard,
                                                                  }) => {
    const m = useContext(ManagerContext)
    const answerIsRevealed = useObservableState(quizCard.answerIsRevealed$)
    const scheduleInfo = useObservableState(
        m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$,
    ) || {
        wordsToReview: [],
        limitedScheduleRows: [],
        wordsLearnedToday: [],
        wordsReviewingOrLearning: [],
        wordsLeftForToday: [],
    }
    const flashCardType = useObservableState(quizCard.flashCardType$) || ''
    const word = useObservableState(quizCard.word$) || ''
    const recognitionRecordIndex = useObservableState(m.wordRecognitionProgressService.indexOfOrderedRecords$) || {}
    const recognitionRecordsForThisCard = (recognitionRecordIndex[word] || [])
        .filter((recognitionRow: WordRecognitionRow) => recognitionRow.flashCardType === flashCardType)
    useSubscription(m.hotkeyEvents.advanceQuiz$, () =>
        quizCard.answerIsRevealed$.next(true),
    )
    return (
        <div className={'quiz-button-row'}>
            {answerIsRevealed ? (
                <DifficultyButtons previousScheduleItems={recognitionRecordsForThisCard} />
            ) : (
                <div>
                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            justifyContent: 'space-between',
                            margin: '24px',
                        }}
                    >
                        <Typography>
                            New Words Left for Today:{' '}
                            <span className={quizUnlearnedNumber}>
                                {scheduleInfo.wordsLeftForToday.length}
                            </span>
                        </Typography>
                        <Typography>
                            Being Learned:{' '}
                            <span className={quizLearningNumber}>
                                {scheduleInfo.wordsReviewingOrLearning.length}
                            </span>
                        </Typography>
                        <Typography>
                            To Review:{' '}
                            <span className={quizToReviewNumber}>
                                {scheduleInfo.wordsToReview.length}
                            </span>
                        </Typography>
                        <Typography>
                            Learned Today:{' '}
                            <span>{scheduleInfo.wordsLearnedToday.length}</span>
                        </Typography>
                    </div>
                </div>
            )}
        </div>
    )
}
