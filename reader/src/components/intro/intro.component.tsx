import {Box, Button, Container, Paper, Tab, Tabs, Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {ManagerContext} from "../../App";
import React, {useContext} from "react";
import {LanguageSelect} from "../app-directory/nodes/language-select.component";
import {SetQuizWordLimit} from "../settings/set-new-quiz-word-limit";
import {introAddLearningMaterial, introLanguageSelect, introSetCardLimit} from "@shared/";
import {UploadText} from "../upload/upload-text.component";


export const Intro = () => {
    const m = useContext(ManagerContext);
    const currentIntroTab = useObservableState(m.settingsService.currentIntroTab$) || 0;
    const NextButton = () => {
        const isLastTab = (currentIntroTab || 0) >= steps.length;
        const onClick = isLastTab ?
            () => {
                m.settingsService.currentIntroTab$.next((currentIntroTab || 0) + 1)
            } : () => {
                m.modalService.intro.open$.next(false)
            }
        ;
        return <Box m={2} p={1}>
            <Button onClick={onClick} variant={'contained'}>
                {
                    isLastTab ? `Finish` : 'Next'
                }
            </Button>
        </Box>
    }
    const steps = [
        {
            Component: () => {
                return <Container id={introLanguageSelect} style={{flex: 1}}>
                    <Paper>
                        <Box m={4} p={1}>
                            <Typography variant={'h4'}>What language would you like to learn?</Typography>
                            <LanguageSelect/>
                            <NextButton/>
                        </Box>
                    </Paper>
                </Container>
            }
        },
        {
            Component: () => {
                return <Container id={introAddLearningMaterial} style={{flex: 1}}>
                    <Paper>
                        <Box m={2} p={1}>
                            <Typography variant={'h4'}>Add some text you'd like to learn here</Typography>
                            <UploadText/>
                            <NextButton/>
                        </Box>
                    </Paper>
                </Container>
            }
        },
        {
            Component: () => {
                return <Container id={introSetCardLimit} style={{flex: 1}}>
                    <Paper>
                        <Box m={2} p={1}> <Typography variant={'h4'}>How many words do you want to learn each day?</Typography>
                            <Box m={2} p={1}><SetQuizWordLimit/></Box>
                            <NextButton/>
                        </Box>
                    </Paper>
                </Container>
            }
        }
    ];
    const SelectedComponent = steps[currentIntroTab]?.Component || steps[0];
    return <Paper style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        justifyContent: 'space-around',
        width: '95vw',
        height: '100vh'
    }}>
        <Tabs
            value={currentIntroTab}
            onChange={(_, newValue) => m.settingsService.currentIntroTab$.next(newValue)}
            indicatorColor="primary"
            textColor="primary"
            centered
        >
            <Tab value={'0'} label="Language Select"/>
            <Tab value={'1'} label="Add learning material"/>
            <Tab value={'2'} label="Configure learning limit"/>
        </Tabs>
        <SelectedComponent/>
    </Paper>
}