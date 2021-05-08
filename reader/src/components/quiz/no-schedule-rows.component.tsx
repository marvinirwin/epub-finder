import { Box, Typography, Button } from '@material-ui/core'
import { outOfWords } from '@shared/'
import { LibraryTable } from '../library/library-table.component'
import React from 'react'
import { goToSignIn } from '../app-directory/nodes/sign-in-with.node'

export const NoScheduleRows = () => {
    return <Box m={2} p={1}>
{/*
        <Typography
            variant={'h3'}
        >
        </Typography>
*/}
        <Button
            variant={'outlined'}
            onClick={() => goToSignIn()}
            style={{display: 'inline-block'}}
        >
            <Typography variant={'h3'}>Sign in to see your saved learning material</Typography>
        </Button>
        <Typography
            style={{display: 'inline-block'}}
            className={outOfWords}
            variant={'h3'}
        >
            &nbsp; Or upload some new ones
        </Typography>
        <LibraryTable />
    </Box>
}