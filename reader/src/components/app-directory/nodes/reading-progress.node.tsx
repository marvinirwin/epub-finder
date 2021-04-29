import { TreeMenuNode } from '../tree-menu-node.interface'
import React, { useContext } from 'react'
import { READING_PROGRESS_NODE } from '@shared/'
import { TrendingUp } from '@material-ui/icons'
import { ManagerContext } from '../../../App'
import { Box, Paper, Typography } from '@material-ui/core'
import { useObservableState } from 'observable-hooks'
import { Manager } from '../../../lib/manager/Manager'
import Button from '@material-ui/core/Button'

export const WordGrid: React.FC<{ words: string[] }> = ({ words }) => {
    const m = useContext(ManagerContext)
    return <Box m={2} p={1}>
        <Paper style={{ display: 'flex', flexFlow: 'row wrap' }}>
            {
                words.map(word => <Button
                    key={word}
                    onClick={() => m.wordCardModalService.word$.next(word)}>
                    {word}
                </Button>)
            }
        </Paper>
    </Box>
}
export const ReadingProgress = () => {
    const m = useContext(ManagerContext)
    const readingProgress = useObservableState(m.readingProgressService.readingProgressRecords$);
    const learnedToday = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$)?.wordsLearnedToday || [];
    return <Box m={2} p={1} style={{ width: '90vw', height: '90vh' }}>
        {
            readingProgress?.map(({
                                      label,
                                      subSequences,
                                      knownSubSequences,
                                      unknownSubSequences,
                                      knownCount,
                                      unknownCount,
                                  }) => <Paper key={label}>
                <Typography>{label}</Typography>
                <Typography>Known: {knownCount} </Typography>
                <Typography>Unknown: {unknownCount}</Typography>
            </Paper>)
        }
        <WordGrid words={learnedToday.map(r => r.d.word)}/>
    </Box>
}

export const ReadingProgressNode = (m: Manager): TreeMenuNode => ({
    name: READING_PROGRESS_NODE,
    label: 'See how how many words you can read',
    action: () => m.modalService.readingProgress.open$.next(true),
    LeftIcon: () => <TrendingUp />,
})
