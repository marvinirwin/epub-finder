import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {Box, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import {formatDueDate} from "../schedule/format-due-date";

export const LeaderBoard = () => {
    const m = useContext(ManagerContext);
    const leaderBoardRecords = useObservableState(m.leaderBoardService.leaderBoard.obs$)?.records || [];
    return <Box p={1} m={2}>
        <TableHead>
            <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Last Learned</TableCell>
                <TableCell>Learned this week</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {
                leaderBoardRecords.map(({
                                            userLabel,
                                            lastLearned: {created_at, word},
                                            learnedThisWeek
                                        }) => <TableRow>
                    <TableCell>
                        {userLabel}
                    </TableCell>
                    <TableCell>
                        {formatDueDate(created_at)}
                        {' '}
                        {word}
                    </TableCell>
                    <TableCell>
                        # Learned this week: {learnedThisWeek}
                    </TableCell>
                </TableRow>)
            }
        </TableBody>
    </Box>;
};