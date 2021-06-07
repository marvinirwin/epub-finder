import { Box } from '@material-ui/core'
import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { QuizCard } from './word-card.interface'
import { useObservableState, useSubscription } from 'observable-hooks'
import { DifficultyButtons } from '../translation-attempt/difficulty-buttons.component'
import { orderBy } from 'lodash'
import { TodaysQuizStats } from './todays-quiz-stats.component'
import { AdvanceButton } from './advance.button.component'

export const QuizCardButtons: React.FC<{ quizCard: QuizCard }> = ({
                                                                      quizCard,
                                                                  }) => {
    const m = useContext(ManagerContext)
    const answerIsRevealed = useObservableState(quizCard.answerIsRevealed$)
    const flash_card_type = useObservableState(quizCard.flashCardType$) || ''
    const word = useObservableState(quizCard.word$) || ''
    const recognitionRecordIndex = useObservableState(m.wordRecognitionProgressRepository.indexOfOrderedRecords$) || {}
    const recognitionRecordsForThisCard = orderBy(
        (recognitionRecordIndex[word] || [])
            .filter(recognitionRow => recognitionRow.flash_card_type === flash_card_type), r => r.created_at.getTime())
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

