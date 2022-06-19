import React from 'react'
import { Box, Container, Paper, Typography } from '@material-ui/core'
import { introAddLearningMaterial } from '@shared/'
import { UploadText } from '../upload/upload-text.component'

export const IntroAddLearningMaterial: React.FC<{children?: React.ReactNode}> = ({ children }) => {
    return (
        <Container id={introAddLearningMaterial} style={{ flex: 1 }}>
            <Paper>
                <Box m={2} p={1}>
                    <Typography variant={'h4'}>
                        Add some text you'd like to learn here
                    </Typography>
                    <UploadText />
                    {children}
                </Box>
            </Paper>
        </Container>
    )
}