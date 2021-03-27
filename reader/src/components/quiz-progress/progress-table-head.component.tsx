import React from "react";
import {TableCell, TableHead, TableRow} from "@material-ui/core";

export const ProgressTableHead: React.FC<{}> = () => {
    return <TableHead>
        <TableRow>
            <TableCell>Word</TableCell>
            <TableCell>Score</TableCell>
            <TableCell>Next Due Date</TableCell>
            <TableCell>Timestamp</TableCell>
            <TableCell>EFactor</TableCell>
        </TableRow>
    </TableHead>
};