import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {Box, Typography} from "@material-ui/core";
import {ScheduleRowTable} from "./schedule-row.table";

export const ScheduleRowsTables = ({word}: { word: string }) => {
    const m = useContext(ManagerContext);
    const scheduleRows =
        useObservableState(
            m.quizCardScheduleRowsService.scheduleRows$,
        )?.filter(r => r.d.word === word) || []
    return <>
        {scheduleRows.map(scheduleRow => <Box m={2} p={1}
                                              key={`${scheduleRow.d.word}.${scheduleRow.d.flash_card_type}`}>
            <Typography variant={'subtitle1'}>{scheduleRow.d.flash_card_type}</Typography>
            <br/>
            <ScheduleRowTable scheduleRow={scheduleRow}/>
        </Box>)}
    </>;
};