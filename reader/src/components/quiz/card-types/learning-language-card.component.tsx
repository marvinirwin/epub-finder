import { QuizCard } from '../word-card.interface'
import { Box, Paper } from '@material-ui/core'
import React from 'react'
import { useObservableState } from 'observable-hooks'
import { CardLearningLanguageText } from '../../word-information/card-learning-language.component'

export const LearningLanguageCard = ({quizCard}: {quizCard: QuizCard}) => {
    const word = useObservableState(quizCard.word$)
    return <Paper style={{display: 'flex', flexFlow: 'column nowrap', width: '100%', height: '100%', alignItems: 'center'}}>
        <Box m={2} p={1}><CardLearningLanguageText word={word || ''} /></Box>
    </Paper>
}