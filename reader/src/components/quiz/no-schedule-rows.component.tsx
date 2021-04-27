import { Box, Typography } from '@material-ui/core'
import { outOfWords } from '@shared/*'
import { LibraryTable } from '../library/library-table.component'
import React from 'react'

export const NoScheduleRows = () => {
    return <Box m={2} p={1}>
        <Typography
            variant={'h3'}
            className={outOfWords}
        >Add or Select more learning material to make more flash cards
        </Typography>
        <LibraryTable />
    </Box>
}