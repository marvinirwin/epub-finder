import {TreeMenuNode} from '../tree-menu-node.interface'
import React, {useState} from 'react'
import {READING_PROGRESS_NODE} from '@shared/'
import {TrendingUp} from '@material-ui/icons'
import {Box, Paper} from '@material-ui/core'
import {Manager} from '../../../lib/manager/Manager'
import {CardLearningLanguageText} from '../../word-information/card-learning-language.component'

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

export const ReadingProgressNode = (m: Manager): TreeMenuNode => ({
    name: READING_PROGRESS_NODE,
    label: 'Progress',
    action: () => m.modalService.readingProgress.open$.next(true),
    LeftIcon: () => <TrendingUp />,
})
