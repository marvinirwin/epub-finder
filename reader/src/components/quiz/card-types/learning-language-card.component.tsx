import { QuizCard } from '../word-card.interface'
import { Paper } from '@material-ui/core'
import { CardImage } from '../quiz-card-image.component'
import React from 'react'
import { useObservableState } from 'observable-hooks'
import { CardLearningLanguageText } from '../../word-information/card-learning-language.component'

export const LearningLanguageCard = ({quizCard}: {quizCard: QuizCard}) => {
    const word = useObservableState(quizCard.word$)
    const image = useObservableState(quizCard.image$.value$);
    return <Paper style={{display: 'flex', flexFlow: 'column nowrap', width: '100%', height: '100%', alignItems: 'center'}}>
        {image && <CardImage wordInfo={quizCard}/>}
        <CardLearningLanguageText word={word || ''} />
    </Paper>
}