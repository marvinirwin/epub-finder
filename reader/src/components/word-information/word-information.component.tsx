import { WordCard } from '../quiz/word-card.interface'
import React, { useContext } from 'react'
import { Paper, TextField, Typography } from '@material-ui/core'
import { CardImage } from '../quiz/quiz-card-image.component'
import { quizCardDescription, wordCardRomanization, wordCardTranslation } from '@shared/'
import { useObservableState } from 'observable-hooks'
import { ManagerContext } from '../../App'
import { flatten } from 'lodash'
import { useLoadingObservableString } from '../../lib/util/create-loading-observable'
import { CardLearningLanguageText } from './card-learning-language.component'
import { RecognitionRowTableComponent } from './recognition-row-table.component'
import { CountRecordTable } from './count-record.table.component'


export const WordInformationComponent: React.FC<{ wordCard: WordCard }> = ({
    wordCard,
}) => {
    const m = useContext(ManagerContext)
    const word = useObservableState(wordCard.word$)
    const scheduleRows =
        useObservableState(
            m.quizCardScheduleRowsService.scheduleRows$,
        )?.filter(r => r.d.word === word) || [];
    const romanization = useLoadingObservableString(wordCard.romanization$, '')
    const translation = useLoadingObservableString(wordCard.translation$, '')
    const description = useObservableState(wordCard.description$.value$)
    return (
        <Paper
            style={{
                display: 'flex',
                flexFlow: 'column nowrap',
                alignItems: 'center',
            }}
        >
            <CardImage wordInfo={wordCard} />
            <CardLearningLanguageText word={word || ''} />
            <Typography variant="h4" className={wordCardRomanization}>
                {romanization}
            </Typography>
            <br />
            <Typography variant="h4" className={wordCardTranslation}>
                {translation}
            </Typography>
            <br />
            <TextField
                label="Description"
                inputProps={{ className: quizCardDescription }}
                multiline
                rows={3}
                variant="filled"
                value={description || ''}
                onChange={(e) => wordCard.description$.set(e.target.value)}
            />
{/*
            {sortInfo && (
                <Fragment>
                    <Typography variant={'subtitle1'}>
                        Count Weight:{' '}
                        {round(sortInfo.count.weightedInverseLogNormalValue, 2)}
                    </Typography>
                    <Typography variant={'subtitle1'}>
                        Date Weight:{' '}
                        {round(
                            sortInfo.dueDate.weightedInverseLogNormalValue,
                            2,
                        )}
                    </Typography>
                    <Typography variant={'subtitle1'}>
                        Length:{' '}
                        {round(
                            sortInfo.length.weightedInverseLogNormalValue,
                            2,
                        )}
                    </Typography>
                    <Typography variant={'subtitle1'}>
                        Sentence Priority:{' '}
                        {round(
                            sortInfo.sentencePriority
                                .weightedInverseLogNormalValue,
                            2,
                        )}
                    </Typography>
                </Fragment>
            )}
*/}
            <br />
            <RecognitionRowTableComponent wordRecognitionRows={flatten(scheduleRows.map(r => r.d.wordRecognitionRecords))} />
            <br />
            <CountRecordTable countRecords={flatten(scheduleRows.map(r => r.d.wordCountRecords))} />
        </Paper>
    )
}
