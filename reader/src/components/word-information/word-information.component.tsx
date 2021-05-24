import { WordCard } from '../quiz/word-card.interface'
import React, { useContext } from 'react'
import { Box, Paper, TextField, Typography } from '@material-ui/core'
import { CardImage } from '../quiz/quiz-card-image.component'
import { quizCardDescription, wordCardRomanization, wordCardTranslation } from '@shared/'
import { useObservableState } from 'observable-hooks'
import { ManagerContext } from '../../App'
import { useLoadingObservableString } from '../../lib/util/create-loading-observable'
import { CardLearningLanguageText } from './card-learning-language.component'
import { ScheduleRowTable } from './schedule-row.table'


export const WordInformationComponent: React.FC<{ wordCard: WordCard }> = ({
                                                                               wordCard,
                                                                           }) => {
    const m = useContext(ManagerContext)
    const word = useObservableState(wordCard.word$)
    const scheduleRows =
        useObservableState(
            m.quizCardScheduleRowsService.scheduleRows$,
        )?.filter(r => r.d.word === word) || []
    const romanization = useLoadingObservableString(wordCard.romanization$, '')
    const translation = useLoadingObservableString(wordCard.translation$, '')
    const description = useObservableState(wordCard.description$.value$)
    return (
        <Paper
            style={{
                height: '90vh',
                width: '90vw',
            }}
        >
            <Box m={2} p={1} style={{
                display: 'flex',
                flexFlow: 'row wrap',
                justifyContent: 'space-between',
            }}>
                <CardImage wordInfo={wordCard} />
                <CardLearningLanguageText word={word || ''} />
                <div style={{ margin: '24px' }}>
                    <Typography variant='h4' className={wordCardRomanization}>
                        {romanization}
                    </Typography>
                    <br />
                    <Typography variant='h4' className={wordCardTranslation}>
                        {translation}
                    </Typography>
                </div>
                <br />
                <TextField
                    label='Description'
                    inputProps={{ className: quizCardDescription }}
                    multiline
                    rows={3}
                    variant='filled'
                    value={description || ''}
                    onChange={(e) => wordCard.description$.set(e.target.value)}
                />
                <br />
                {scheduleRows.map(scheduleRow => <Box m={2} p={1}
                                                      key={`${scheduleRow.d.word}.${scheduleRow.d.flash_card_type}`}>
                    <Typography variant={'subtitle1'}>{scheduleRow.d.flash_card_type}</Typography>
                    <br />
                    <ScheduleRowTable scheduleRow={scheduleRow} />
                </Box>)}
                <br />
                {/*
            <CountRecordTable countRecords={flatten(scheduleRows.map(r => r.d.wordCountRecords))} />
*/}
            </Box>
        </Paper>
    )
}
