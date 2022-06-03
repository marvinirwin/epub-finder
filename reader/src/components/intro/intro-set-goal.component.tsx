import React from 'react'
import { Box, Container, Paper, Typography } from '@material-ui/core'
import { introSetCardLimit } from '@shared/'
import { SetQuizWordLimit } from '../settings/set-new-quiz-word-limit.component'

export const IntroSetGoal: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
        <Container id={introSetCardLimit} style={{ flex: 1 }}>
            <Paper>
                <Box m={2} p={1}>
                    {' '}
                    <Typography variant={'h4'}>
                        How many words do you want to learn each day?
                    </Typography>
                    <Box m={2} p={1}>
                        <SetQuizWordLimit />
                    </Box>
                    {children}
                </Box>
            </Paper>
        </Container>
    )
}