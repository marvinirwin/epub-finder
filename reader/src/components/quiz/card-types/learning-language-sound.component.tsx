import React from 'react'
import { Box, Paper, Typography } from '@material-ui/core'
import { QuizCardSound } from '../quiz-card-sound.component'
import { QuizCard } from '../word-card.interface'
import { CardImage } from '../quiz-card-image.component'

export const LearningLanguageSound = ({quizCard}: {quizCard: QuizCard}) => {
    // Just display the picture and the sound, vertically
    return <Paper style={{display: 'flex', flexFlow: 'column nowrap', width: '100%', height: '100%', alignItems: 'center'}}>
        <Box m={2} p={1}><CardImage wordInfo={quizCard}/></Box>
        <Box m={2} p={1}><QuizCardSound quizCard={quizCard} /></Box>
    </Paper>
}