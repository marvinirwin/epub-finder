import { Box, Typography, Button } from '@material-ui/core'
import { outOfWords } from '@shared/'
import { LibraryTable } from '../library/library-table.component'
import React from 'react'
import { goToSignIn } from '../app-directory/nodes/sign-in-with.node'

export const NoScheduleRows = () => {
    return <Box m={2} p={1} style={{width: '100%', height: '100%'}}>
{/*
        <Typography
            variant={'h3'}
        >
        </Typography>
*/}
        <Button
            variant={'outlined'}
            onClick={() => goToSignIn()}
            style={{display: 'inline'}}
        >
            <Typography variant={'h3'}>Sign in </Typography>
        </Button>
        <Typography
            style={{display: 'inline'}}
            className={outOfWords}
            variant={'h3'}
        >
            &nbsp; to see your saved learning material, or try uploading some
        </Typography>
        <LibraryTable />
    </Box>
}