import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {Box, Typography} from "@material-ui/core";
import {ScheduleRowTable} from "./schedule-row.table";
import {SpacedScheduleRow} from "../../lib/manager/space-schedule-row.type";
import { ExpandOnClick } from "../app-container/expandable-container";

const ScheduleRowTableContainer: React.FC<{scheduleRow: SpacedScheduleRow}> = ({scheduleRow}) => <Box m={2} p={1}
                                                          key={`${scheduleRow.d.word}.${scheduleRow.d.flash_card_type}`}>
    <Typography variant={'subtitle1'}>{scheduleRow.d.flash_card_type}</Typography>
    <br/>
    <ScheduleRowTable scheduleRow={scheduleRow}/>
</Box>;

export const ScheduleRowsTables = ({word}: { word: string }) => {
    const m = useContext(ManagerContext);
    const scheduleRows =
        useObservableState(
            m.quizCardScheduleRowsService.scheduleRows$,
        )?.filter(r => r.d.word === word) || []
    return <>
        {scheduleRows.map(scheduleRow => <ExpandOnClick>
            <ScheduleRowTableContainer scheduleRow={scheduleRow}/>
        </ExpandOnClick>)}
    </>;
};