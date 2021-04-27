import React from 'react'
import { Paper, Typography } from '@material-ui/core'
import { QuizCardSound } from '../quiz-card-sound.component'
import { QuizCard } from '../word-card.interface'
import { CardImage } from '../quiz-card-image.component'

export const LearningLanguageSound = ({quizCard}: {quizCard: QuizCard}) => {
    // Just display the picture and the sound, vertically
    return <Paper style={{display: 'flex', flexFlow: 'column nowrap'}}>
        <CardImage quizCard={quizCard}/>
        <QuizCardSound quizCard={quizCard} />
    </Paper>
}