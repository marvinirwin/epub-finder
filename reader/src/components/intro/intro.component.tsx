import { Box, Container, Paper, Tab, Tabs, Typography } from '@material-ui/core'
import { useObservableState } from 'observable-hooks'
import { ManagerContext } from '../../App'
import React, { useContext } from 'react'
import { LanguageSelect } from '../app-directory/nodes/language-select.component'
import { SetQuizWordLimit } from '../settings/set-new-quiz-word-limit.component'
import {
    introAddLearningMaterial,
    introLanguageSelect,
    introSetCardLimit,
} from '@shared/'
import { UploadText } from '../upload/upload-text.component'
import { NextButton } from './intro-next-button.component'

const IntroLanguageSelect: React.FC = ({ children }) => {
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
const IntroAddLearningMaterial: React.FC = ({ children }) => {
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
const IntroSetGoal: React.FC = ({ children }) => {
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
export const Intro = () => {
    const m = useContext(ManagerContext)
    const currentIntroTab =
        useObservableState(m.settingsService.currentIntroTab$) || 0
    const steps = [
        {
            Component: IntroLanguageSelect,
        },
        {
            Component: IntroAddLearningMaterial,
        },
        {
            Component: IntroSetGoal,
        },
    ]
    const SelectedComponent =
        steps[currentIntroTab]?.Component || steps[0]?.Component
    return (
        <Paper
            style={{
                display: 'flex',
                flexFlow: 'column nowrap',
                justifyContent: 'space-around',
                width: '95vw',
                height: '100vh',
            }}
        >
            <Tabs
                value={currentIntroTab}
                onChange={(_, newValue) => {
                    m.settingsService.currentIntroTab$.next(newValue)
                }}
                indicatorColor="primary"
                textColor="primary"
                centered
            >
                <Tab value={0} label="Language Select" />
                <Tab value={1} label="Add learning material" />
                <Tab value={2} label="Configure learning limit" />
            </Tabs>
            <SelectedComponent>
                <NextButton steps={steps} currentTab={currentIntroTab} />
            </SelectedComponent>
        </Paper>
    )
}
