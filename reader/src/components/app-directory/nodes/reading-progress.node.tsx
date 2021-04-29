import { TreeMenuNode } from '../tree-menu-node.interface'
import {uniq} from 'lodash';
import React, { useContext } from 'react'
import { READING_PROGRESS_NODE } from '@shared/'
import { TrendingUp } from '@material-ui/icons'
import { ManagerContext } from '../../../App'
import { Box, Paper, Typography } from '@material-ui/core'
import { useObservableState } from 'observable-hooks'
import { Manager } from '../../../lib/manager/Manager'
import { CardLearningLanguageText } from '../../word-information/word-information.component'

export const WordGrid: React.FC<{ words: string[] }> = ({ words }) => {
    const m = useContext(ManagerContext)
    return <Box m={2} p={1}>
        <Paper style={{ display: 'flex', flexFlow: 'row wrap' }}>
            {
                words.map(word => <CardLearningLanguageText variant={'h3'} key={word} word={word}/>)
            }
        </Paper>
    </Box>
}
export const ReadingProgress = () => {
    const m = useContext(ManagerContext)
    const readingProgress = useObservableState(m.readingProgressService.readingProgressRecords$);
    const learnedToday = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$)?.wordsLearnedToday || [];
    return <Box m={2} p={1} style={{ width: '90vw', height: '90vh' }}>
        <Box m={2} p={1}>
            <Typography variant={'h4'}>Words Learned Today</Typography>
            <WordGrid words={uniq(learnedToday.map(r => r.d.word))}/>
        </Box>
        {
            readingProgress?.map(({
                                      label,
                                      subSequences,
                                      knownSubSequences,
                                      unknownSubSequences,
                                      knownCount,
                                      unknownCount,
                                  }) => <Paper key={label}>
                <Box m={2} p={1}><Typography variant={'h3'}>{label}</Typography></Box>
                <Box m={2} p={1}><Typography variant={'subtitle1'}>Known: {knownCount} </Typography></Box>
                <Box m={2} p={1}><Typography variant={'subtitle1'}>Unknown: {unknownCount}</Typography></Box>
            </Paper>)
        }
    </Box>
}

export const ReadingProgressNode = (m: Manager): TreeMenuNode => ({
    name: READING_PROGRESS_NODE,
    label: 'See how how many words you can read',
    action: () => m.modalService.readingProgress.open$.next(true),
    LeftIcon: () => <TrendingUp />,
})
