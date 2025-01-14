import { Box, Button } from '@material-ui/core'
import React, { useCallback, useContext } from 'react'
import { ManagerContext } from '../../App'
import { introNextButton } from '@shared/'

export const NextButton: React.FC<{ currentTab: number; steps: unknown[] }> = ({
                                                                                   currentTab,
                                                                                   steps,
                                                                               }) => {
    const m = useContext(ManagerContext)
    const isLastTab = currentTab >= steps.length - 1
    const onClick = useCallback(isLastTab
        ? () => {
            // m.modalService.intro.open$.next(false)
        }
        : () => {
            m.settingsService.currentIntroTab$.user$.next(currentTab + 1)
        }, [isLastTab])
    return (
        <Box m={2} p={1}>
            <Button onClick={onClick} variant={'contained'} id={introNextButton}>
                {isLastTab ? `Finish` : 'Next'}
            </Button>
        </Box>
    )
}
