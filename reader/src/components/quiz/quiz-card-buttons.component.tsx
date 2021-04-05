import { Box, Button, Typography } from '@material-ui/core'
import {
    quizButtonReveal,
    quizLearnedTodayNumber,
    quizLearningNumber,
    quizToReviewNumber,
    quizWordsLeftForTodayNumber,
} from '@shared/'
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
        <Box m={2} p={1}>
            <HotkeyWrapper action={'ADVANCE_QUIZ'}>
                <Button
                    variant={'contained'}
                    id={quizButtonReveal}
                    onClick={() => m.hotkeyEvents.advanceQuiz$.next()}
                >
                    Reveal
                </Button>
            </HotkeyWrapper>
        </Box>
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
        .filter((recognitionRow: WordRecognitionRow) => recognitionRow.flashCardType === flashCardType);
    useSubscription(m.hotkeyEvents.advanceQuiz$, () =>
        quizCard.answerIsRevealed$.next(true),
    )
    return answerIsRevealed ? (
        <Box m={2} p={1} style={{
            display: 'flex',
            flexFlow: 'row nowrap',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-around',
        }}>
            <DifficultyButtons previousScheduleItems={recognitionRecordsForThisCard} />
        </Box>
    ) : (
        <Box m={2} p={1} style={{ display: 'flex', flexFlow: 'column nowrap', width: '100%', alignItems: 'center' }}>
            <AdvanceButton />
            <Box m={2} p={1} className={'quiz-button-row'}>
                <Typography variant={'h6'}>
                    New Words Left for Today:{' '}
                    <span className={quizWordsLeftForTodayNumber}>
                                {scheduleInfo.wordsLeftForToday.length}
                            </span>
                </Typography>
                <Typography variant={'h6'}>
                    Being Learned:{' '}
                    <span className={quizLearningNumber}>
                                {scheduleInfo.wordsReviewingOrLearning.length}
                            </span>
                </Typography>
                <Typography variant={'h6'}>
                    To Review:{' '}
                    <span className={quizToReviewNumber}>
                                {scheduleInfo.wordsToReview.length}
                            </span>
                </Typography>
                <Typography variant={'h6'}>
                    Learned Today:{' '}
                    <span className={quizLearnedTodayNumber}>{scheduleInfo.wordsLearnedToday.length}</span>
                </Typography>
            </Box>
        </Box>
    )
}
