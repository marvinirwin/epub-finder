import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {Box, TableBody, TableCell, TableHead, TableRow, Table, TableContainer} from "@material-ui/core";
import {formatDueDate} from "../schedule/format-due-date";
import {parseISO} from "date-fns";

export const LeaderBoard = () => {
    const m = useContext(ManagerContext);
    const leaderBoardRecords = useObservableState(m.leaderBoardService.leaderBoard.obs$)?.records || [];
    return <Box p={1} m={2} style={{width: '90vw', height: '90vh'}}>
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Last Learned</TableCell>
                        <TableCell>Review instances per week</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        leaderBoardRecords.map(({
                                                    userLabel,
                                                    lastRecognitionRecord: {created_at, word},
                                                    recognitionRecordsThisWeek
                                                }) => <TableRow>
                            <TableCell>
                                {userLabel}
                            </TableCell>
                            <TableCell>
                                {formatDueDate(parseISO(created_at as unknown as string))}
                                {' '}
                                {word}
                            </TableCell>
                            <TableCell>
                                 {recognitionRecordsThisWeek}
                            </TableCell>
                        </TableRow>)
                    }
                </TableBody>
            </Table>
        </TableContainer>
    </Box>;
};