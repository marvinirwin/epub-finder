import { QuizCard } from '../word-card.interface'
import { Paper, Typography } from '@material-ui/core'
import { CardImage } from '../quiz-card-image.component'
import React from 'react'
import { useLoadingObservableString } from '../../../lib/util/create-loading-observable'

export const KnownLanguageCard = (
    {quizCard}: {quizCard: QuizCard}
) => {
    const translation = useLoadingObservableString(quizCard.translation$, '')
    return <Paper style={{display: 'flex', flexFlow: 'column nowrap'}}>
        <CardImage quizCard={quizCard}/>
        <Typography variant='subtitle1'>Known language</Typography>
        <Typography variant='h1'>{translation}</Typography>
    </Paper>
}