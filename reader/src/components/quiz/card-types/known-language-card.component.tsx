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
        <div style={{display: 'flex', flexFlow: 'column nowrap', alignItems: 'center', justifyContent: 'center', flex: 1}} className={'prose'}>
            <h4 className={'mx-4 w-full whitespace-pre'}>{translation?.split('/').join('\n')}</h4>
        </div>
    </Fragment>
}