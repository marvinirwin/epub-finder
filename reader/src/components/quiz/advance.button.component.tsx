import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { Box, Button, Typography } from '@material-ui/core'
import { HotkeyWrapper } from '../hotkeys/hotkey-wrapper'
import { quizButtonReveal } from '@shared/'

export const AdvanceButton = () => {
    const m = useContext(ManagerContext)
    return (
        <Box m={2} p={1}>
            <HotkeyWrapper action={'ADVANCE_QUIZ'}>
                <Button
                    variant={'contained'}
                    id={quizButtonReveal}
                    onClick={() => m.hotkeyEvents.advanceQuiz$.next()}

                >
                    <Typography variant={'h3'}>Reveal</Typography>
                </Button>
            </HotkeyWrapper>
        </Box>
    )
}