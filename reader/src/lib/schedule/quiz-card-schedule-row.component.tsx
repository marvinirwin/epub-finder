import React from 'react'
import { useObservableState } from 'observable-hooks'
import { QuizCard } from '../../components/quiz/word-card.interface'
import { TextField, Typography } from '@material-ui/core'
import {
    quizCardDescription,
    quizCardRomanization,
    quizCardTranslation,
} from '@shared/'
import { useIsFieldHidden } from '../../components/quiz/useIsFieldHidden'
import { QuizCardField } from '../quiz/hidden-quiz-fields'
import { useLoadingObservableString } from '../util/create-loading-observable'

export const QuizCardScheduleRowDisplay = ({
    quizCard,
}: {
    quizCard: QuizCard
}) => {
    const description = useObservableState(quizCard.description$.value$)
    const romanization = useLoadingObservableString(quizCard.romanization$, '')
    const translation = useLoadingObservableString(quizCard.translation$, '')
    const isDescriptionHidden = useIsFieldHidden({
        quizCard,
        label: QuizCardField.Description,
    })
    const isRomanizationHidden = useIsFieldHidden({
        quizCard,
        label: QuizCardField.Romanization,
    })
    const isDefinitionHidden = useIsFieldHidden({
        quizCard,
        label: QuizCardField.KnownLanguageDefinition
    })
    return (
        <div>
            <div style={{ marginTop: '24px' }}>
                <Typography variant="h4" className={quizCardRomanization}>
                    {isRomanizationHidden ? '' : romanization}
                </Typography>
                <br />
                <Typography variant="h4" className={quizCardTranslation}>
                    {isDefinitionHidden ? '' : translation}
                </Typography>
            </div>
            <div style={{ marginTop: '24px', marginBottom: '24px', display: 'flex' }}>
                {isDescriptionHidden ? (
                    ''
                ) : (
                    <TextField
                        label="Description"
                        inputProps={{ className: quizCardDescription }}
                        multiline
                        rows={3}
                        variant="filled"
                        value={description}
                        style={{width: '300px', height: '300px'}}
                        onChange={(e) =>
                            quizCard.description$.set(e.target.value)
                        }
                    />
                )}
            </div>
        </div>
    )
}
