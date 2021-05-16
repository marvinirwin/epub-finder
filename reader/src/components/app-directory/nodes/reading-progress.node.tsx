import { TreeMenuNode } from '../tree-menu-node.interface'
import { uniq } from 'lodash'
import React, { Fragment, useContext, useState } from 'react'
import { READING_PROGRESS_NODE } from '@shared/'
import { TrendingUp } from '@material-ui/icons'
import { ManagerContext } from '../../../App'
import { Box, Fade, Menu, Paper, Typography } from '@material-ui/core'
import { useObservableState } from 'observable-hooks'
import { Manager } from '../../../lib/manager/Manager'
import { CardLearningLanguageText } from '../../word-information/word-information.component'

export const WordGrid: React.FC<{ words: string[], limit?: number }> = ({ words, limit }) => {
    const [extraOpen, setExtraOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState();
    return <Box m={2} p={1}>
        <Paper
            style={{ display: 'flex', flexFlow: 'row wrap' }}
            onMouseEnter={() => setExtraOpen(true)}
            onMouseLeave={() => setExtraOpen(false)}
            ref={setAnchorEl}
        >
            {
                words.slice(0, limit).map(word => <CardLearningLanguageText variant={'h3'} key={word} word={word} />)
            }
        </Paper>
{/*
        <Menu
            anchorEl={anchorEl}
            keepMounted
            open={extraOpen}
            onClose={() => setExtraOpen(false)}
            TransitionComponent={Fade}
        >
            {
                words.slice(limit).map(word => <CardLearningLanguageText variant={'h3'} key={word} word={word} />)
            }
        </Menu>
*/}
    </Box>
}
export const ReadingProgress = () => {
    const m = useContext(ManagerContext)
    const readingProgress = useObservableState(m.readingProgressService.readingProgressRecords$)
    const learnedToday = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$)?.wordsLearnedForTheFirstTimeToday || []
    return <Box m={2} p={1} style={{ width: '90vw', height: '90vh' }}>
        <Box m={2} p={1}>
            {learnedToday.length > 0 ?
                <Fragment>
                    <Typography variant={'h4'}>Words Learned Today</Typography>
                    <WordGrid words={uniq(learnedToday.map(r => r.d.word))} />
                </Fragment> :
                <Typography variant={'h3'}>No words learned today</Typography>
            }
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
                <Box m={2} p={1}>
                    <Typography variant={'h3'}>Known</Typography>
                    <WordGrid words={uniq(knownSubSequences.map(r => r.word))}/>
                </Box>
                <Box m={2} p={1}>
                    <Typography variant={'h3'}>New Words</Typography>
                    <WordGrid words={uniq(unknownSubSequences.map(r => r.word))}/>
                </Box>
            </Paper>)
        }
    </Box>
}

export const ReadingProgressNode = (m: Manager): TreeMenuNode => ({
    name: READING_PROGRESS_NODE,
    label: 'Progress',
    action: () => m.modalService.readingProgress.open$.next(true),
    LeftIcon: () => <TrendingUp />,
})
