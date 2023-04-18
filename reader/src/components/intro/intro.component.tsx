import { Paper, Tab, Tabs } from '@material-ui/core'
import { useObservableState } from 'observable-hooks'
import { ManagerContext } from '../../App'
import React, { useContext } from 'react'
import { NextButton } from './intro-next-button.component'
import { IntroLanguageSelect } from './intro-language-select.component'
import { IntroAddLearningMaterial } from './intro-add-learning-material.component'
import { IntroSetGoal } from './intro-set-goal.component'

export const Intro = () => {
    const m = useContext(ManagerContext)
    const currentIntroTab =
        useObservableState(m.settingsService.currentIntroTab$.obs$) || 0
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
    const SelectedComponent: React.FC<{children?: React.ReactNode}> = steps[currentIntroTab]?.Component || steps[0]?.Component
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
                    m.settingsService.currentIntroTab$.user$.next(newValue)
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
