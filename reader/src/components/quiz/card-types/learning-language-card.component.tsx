import { QuizCard } from '../word-card.interface'
import { Paper } from '@material-ui/core'
import { CardImage } from '../quiz-card-image.component'
import { QuizCardSound } from '../quiz-card-sound.component'
import React from 'react'
import { CardLearningLanguageText } from '../../word-information/word-information.component'
import { useObservableState } from 'observable-hooks'

export const LearningLanguageCard = ({quizCard}: {quizCard: QuizCard}) => {
    const word = useObservableState(quizCard.word$)
    return <Paper style={{display: 'flex', flexFlow: 'column nowrap', width: '100%', height: '100%'}}>
        <CardImage wordInfo={quizCard}/>
        <CardLearningLanguageText word={word || ''} />
    </Paper>
}