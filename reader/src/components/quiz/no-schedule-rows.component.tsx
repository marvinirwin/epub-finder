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
            variant={'contained'}
            onClick={() => goToSignIn()}
        >
            Sign in
        </Button>
        <Typography
            className={outOfWords}
            variant={'h3'}
        >
            or add more Learning Material
        </Typography>
        <LibraryTable />
    </Box>
}