import React, {Fragment, useContext} from "react";
import {ManagerContext} from "../App";
import {useObservableState} from "observable-hooks";
import {Box, Paper, Typography} from "@material-ui/core";
import {uniq} from "lodash";
import {WordGrid} from "./app-directory/nodes/reading-progress.node";

export const ReadingProgress = () => {
    const m = useContext(ManagerContext)
    const readingProgress = useObservableState(m.readingProgressService.readingProgressRecords$)
    const learnedToday = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$)?.wordsLearnedToday || []
    return <Box m={2} p={1} style={{width: '90vw', height: '90vh'}}>
        <Box m={2} p={1}>
            {learnedToday.length > 0 ?
                <Fragment>
                    <Typography variant={'h6'}>Words Learned Today</Typography>
                    <WordGrid words={uniq(learnedToday.map(r => r.d.word))}/>
                </Fragment> :
                <Typography variant={'h6'}>No words learned today</Typography>
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
                <Box m={2} p={1}><Typography variant={'h4'}>{label}</Typography></Box>
                <Box m={2} p={1}>
                    <Typography variant={'h6'}>Known</Typography>
                    <WordGrid words={uniq(knownSubSequences.map(r => r.word))}/>
                </Box>
                <Box m={2} p={1}>
                    <Typography variant={'h6'}>New Words</Typography>
                    <WordGrid words={uniq(unknownSubSequences.map(r => r.word))}/>
                </Box>
            </Paper>)
        }
    </Box>
}