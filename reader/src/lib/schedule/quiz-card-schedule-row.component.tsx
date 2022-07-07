import React from 'react'
import { useObservableState } from 'observable-hooks'
import { QuizCard } from '../../components/quiz/word-card.interface'
import { TextField, Typography } from '@material-ui/core'
import {
    quizCardDescription,
    quizCardRomanization,
    quizCardTranslation,
} from 'languagetrainer-server/src/shared'
import { useLoadingObservableString } from '../util/create-loading-observable'
import {DictionaryDefinition} from "../../components/quiz/card-types/dictionary-definition.component";
import { useVisibleObservableState} from "../../components/UseVisilbleObservableState/UseVisibleObservableState";
import { useConcatArray } from '../util/useConcatArray'
import { EmittedValues } from "../../components/UseVisilbleObservableState/EmittedValues.component";

export const QuizCardScheduleRowDisplay = ({
    quizCard,
}: {
    quizCard: QuizCard
}) => {
    const description = useObservableState(quizCard.description$.value$)
    const romanization = useLoadingObservableString(quizCard.romanization$, '')
    const translation = useLoadingObservableString(quizCard.translation$, '')
    const emittedTranslations = useVisibleObservableState(quizCard.translation$.obs$, (t) => `quizCard.translation$.obs$: ${t}`);
    const emittedRomanizations = useVisibleObservableState(quizCard.romanization$.obs$, (t) => `quizCard.romanizations$.obs$: ${t}`);
    const emittedDescriptions = useVisibleObservableState(quizCard.description$.value$, (t) => `quizCard.description$.value$.obs$: ${t}`);

    const word = useObservableState(quizCard.word$) || '';
    return (
        <div style={{position: 'absolute'}}>
            <EmittedValues emittedValues={useConcatArray(emittedTranslations, emittedRomanizations, emittedDescriptions)} id={'quiz-card-schedule-row'}/>
            <div style={{ marginTop: '24px' }}>
                <Typography variant="h4" className={quizCardRomanization}>
                    {romanization}
                </Typography>
                <br />
                <DictionaryDefinition word={word}/>
                <Typography variant="h4" className={quizCardTranslation}>
                    {translation}
                </Typography>
            </div>
            <div style={{ marginTop: '24px', marginBottom: '24px', display: 'flex' }}>
                {
                    <TextField
                        label="Description"
                        inputProps={{ className: quizCardDescription }}
                        multiline
                        rows={3}
                        variant="filled"
                        value={description}
                        style={{width: '300px', flex: 1}}
                        onChange={(e) =>
                            quizCard.description$.set(e.target.value)
                        }
                    />
                }
            </div>
        </div>
    )
}
