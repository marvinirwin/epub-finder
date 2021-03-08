import React, {useContext} from "react";
import {Paper, Table, TableBody, TableContainer,} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {ManagerContext} from "../App";
import {orderBy} from "lodash";
import {ProgressTableRow} from "./progress-table-row.component";
import {ProgressTableHead} from "./progress-table-head.component";
import {ProgressTableToolbar} from "./progress-table-toolbar.component";

export const ProgressTableComponent = () => {
    const m = useContext(ManagerContext);
    const recognitionRecords = useObservableState(m.wordRecognitionProgressService.recordList$) || [];
    return <div>
        <ProgressTableToolbar/>
        <TableContainer component={Paper}>
            <Table size='small'>
                <ProgressTableHead/>
                <TableBody>
                    {
                        orderBy(
                            recognitionRecords.filter(r => r.grade >= 3),
                            r => r.timestamp, 'desc')
                            .map(
                                recognitionRecord => <ProgressTableRow
                                    recognitionRecord={recognitionRecord}
                                    key={recognitionRecord.timestamp.getTime()}
                                />)
                    }
                </TableBody>
            </Table>
        </TableContainer>
    </div>
}