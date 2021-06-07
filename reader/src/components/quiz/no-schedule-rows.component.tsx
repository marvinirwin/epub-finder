import { Box, Button, Link, Typography } from '@material-ui/core'
import { LibraryTable } from '../library/library-table.component'
import React, { useContext } from 'react'
import { goToSignIn } from '../app-directory/nodes/sign-in-with.node'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { UploadText } from '../upload/upload-text.component'


export const AddNewOrSelectDifferentLearningMaterial = () => {
    return <Typography variant={'h4'}>
        Out of learning material.  Select or add more text
    </Typography>
}
export const LogInToSeeLearningMaterial = () => {
    return <Typography variant={'h4'}>
        Out of learning material. Add more text or <Link href={`${process.env.PUBLIC_URL}/languagetrainer-auth/keycloak`}>Sign In</Link> to see previously saved text
    </Typography>
}

export const NoScheduleRows = () => {
    const m = useContext(ManagerContext)
    const isLoggedIn = useObservableState(m.loggedInUserService.isLoggedIn$)
    return <Box m={2} p={1} style={{ width: '100%', height: '100%' }}>
        {/*
        <Typography
            variant={'h3'}
        >
        </Typography>
*/}
        <Box m={2} p={1}>{
            isLoggedIn ? <AddNewOrSelectDifferentLearningMaterial /> : <LogInToSeeLearningMaterial />
        }</Box>
        <UploadText />
        <LibraryTable />
    </Box>
}