import React, {useContext} from "react";
import {ManagerContext} from "../../../App";
import {useObservableState} from "observable-hooks";
import {Paper, Table, TableBody, TableContainer} from "@material-ui/core";
import {
    TranslationAttemptScheduleTableRow,
    TranslationAttemptTableHead,
    TranslationAttemptTableToolbar
} from "./translation-attempt-schedule";

export const TranslationAttemptScheduleTable: React.FC = () => {
    const m = useContext(ManagerContext);
    const translationAttemptScheduleRows = useObservableState(
        m.translationAttemptScheduleService.indexedScheduleRows$) || {};
    return <div>
        <TranslationAttemptTableToolbar/>
        <TableContainer component={Paper}>
            <Table size='small'>
                <TranslationAttemptTableHead/>
                <TableBody>
                    {
                        Object.entries(translationAttemptScheduleRows)
                            .map(scheduleRow => <TranslationAttemptScheduleTableRow scheduleRow={scheduleRow}/>)
                    }
                </TableBody>
            </Table>
        </TableContainer>
    </div>
};