import {Box, Button} from "@material-ui/core";
import React, {useContext} from "react";
import {ManagerContext} from "../../App";

export const NextButton: React.FC<{currentTab: number, steps: unknown[]}> = ({currentTab, steps}) => {
    const m = useContext(ManagerContext);
    const isLastTab = currentTab >= (steps.length - 1);
    const onClick = isLastTab ?
        () => {
            m.modalService.intro.open$.next(false)
        } : () => {
            m.settingsService.currentIntroTab$.next(currentTab + 1)
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