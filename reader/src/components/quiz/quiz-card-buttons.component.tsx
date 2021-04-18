import { Box, Button } from '@material-ui/core'
import { quizButtonReveal } from '@shared/'
import React, { useContext, useState } from 'react'
import { ManagerContext } from '../../App'
import { QuizCard } from './word-card.interface'
import { useObservableState, useSubscription } from 'observable-hooks'
import { HotkeyWrapper } from '../hotkeys/hotkey-wrapper'
import { DifficultyButtons } from '../translation-attempt/difficulty-buttons.component'
import { WordRecognitionRow } from '../../lib/schedule/word-recognition-row'
import { orderBy } from 'lodash'
import { TodaysQuizStats } from './todays-quiz-stats.component'

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
    const flashCardType = useObservableState(quizCard.flashCardType$) || ''
    const word = useObservableState(quizCard.word$) || ''
    const recognitionRecordIndex = useObservableState(m.wordRecognitionProgressService.indexOfOrderedRecords$) || {}
    const recognitionRecordsForThisCard = orderBy(
        (recognitionRecordIndex[word] || [])
            .filter((recognitionRow: WordRecognitionRow) => recognitionRow.flashCardType === flashCardType), r => r.timestamp.getTime())
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
            <DifficultyButtons quizCard={quizCard} previousScheduleItems={recognitionRecordsForThisCard} />
        </Box>
    ) : (
        <Box m={2} p={1} style={{ display: 'flex', flexFlow: 'column nowrap', width: '100%', alignItems: 'center' }}>
            <AdvanceButton />
            <TodaysQuizStats/>
        </Box>
    )
}

