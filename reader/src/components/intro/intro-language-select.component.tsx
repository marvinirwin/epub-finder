import React from 'react'
import {Box, Container, Link, Paper, Typography} from '@material-ui/core'
import { introLanguageSelect } from '@shared/'
import { LanguageSelect } from '../app-directory/nodes/language-select.component'
import { signInUrl } from '../app-directory/nodes/sign-in-with.node'

export const IntroLanguageSelect: React.FC<{children?: React.ReactNode}> = ({ children }) => {
    return (
        <Container id={introLanguageSelect} style={{ flex: 1 }}>
            <Paper>
                <Box m={4} p={1}>
                    <Typography variant='h4'><Link href={signInUrl}>Sign In</Link></Typography>
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