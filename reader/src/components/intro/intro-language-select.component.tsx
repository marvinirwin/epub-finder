import React from 'react'
import { Box, Container, Paper, Typography } from '@material-ui/core'
import { introLanguageSelect } from '@shared/'
import { LanguageSelect } from '../app-directory/nodes/language-select.component'

export const IntroLanguageSelect: React.FC = ({ children }) => {
    return (
        <Container id={introLanguageSelect} style={{ flex: 1 }}>
            <Paper>
                <Box m={4} p={1}>
                    <Typography variant={'h4'}>
                        What language would you like to learn?
                    </Typography>
                    <LanguageSelect />
                    {children}
                </Box>
            </Paper>
        </Container>
    )
}