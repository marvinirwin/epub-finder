import { QuizCard } from '../word-card.interface'
import { Paper, Typography } from '@material-ui/core'
import { CardImage } from '../quiz-card-image.component'
import React, {Fragment} from 'react'
import { useLoadingObservableString } from '../../../lib/util/create-loading-observable'
import { useObservableState } from 'observable-hooks'

export const KnownLanguageCard = (
    {quizCard}: {quizCard: QuizCard}
) => {
    const translation = useLoadingObservableString(quizCard.translation$, '');
    const imageSrc = useObservableState(quizCard.image$.value$);
    return <Fragment>
        {imageSrc && <CardImage wordInfo={quizCard}/>}
        <div style={{display: 'flex', flexFlow: 'column nowrap', alignItems: 'center'}}>
            <Typography variant='h1'>{translation}</Typography>
        </div>
    </Fragment>
}