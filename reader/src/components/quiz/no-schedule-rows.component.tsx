import { Box, Link, Typography } from '@material-ui/core'
import { LibraryTable } from '../library/library-table.component'
import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { UploadText } from '../upload/upload-text.component'
import { SetQuizWordLimit } from '../settings/set-new-quiz-word-limit.component'


export const AddNewOrSelectDifferentLearningMaterial = () => {
    return <Typography variant={'h4'}>
        Add new or selected existing text in the library
    </Typography>
}
export const LogInToSeeLearningMaterial = () => {
    return <Typography variant={'h4'}>
        Out of learning material. Add more text or <Link
        href={`${process.env.PUBLIC_URL}/languagetrainer-auth/keycloak`}>Sign In</Link> to see previously saved text
    </Typography>
}

export const LimitReached = () => {
    const m = useContext(ManagerContext)
    return <Typography variant={'h4'}>
        Todays new word limit reached: <SetQuizWordLimit />
    </Typography>
}

export const NoScheduleRows = () => {
    const m = useContext(ManagerContext)
    const isLoggedIn = useObservableState(m.loggedInUserService.isLoggedIn$)
    const limitedScheduleRowData = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$)
    const cardLimitReached = limitedScheduleRowData?.scheduleRowsLeftForToday?.length === 0 &&
        !!limitedScheduleRowData.limitedScheduleRows.length;

    return <Box m={2} p={1} style={{ width: '100%', height: '100%' }}>

        {/*
        <Typography
            variant={'h3'}
        >
        </Typography>
*/}
        <Box m={2} p={1}>
            {cardLimitReached && <LimitReached />}
            {isLoggedIn && !cardLimitReached && <AddNewOrSelectDifferentLearningMaterial />}
            {!isLoggedIn && !cardLimitReached && <LogInToSeeLearningMaterial />}
        </Box>
        <UploadText />
        <LibraryTable />
    </Box>
}