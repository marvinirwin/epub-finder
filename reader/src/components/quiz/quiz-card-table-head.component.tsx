import { TableCell, TableHead, TableRow} from "@material-ui/core";
import React from "react";

export const QuizCardTableHead: React.FC<{}> = () => {
    return <TableHead>
        <TableRow>
            <TableCell style={{minWidth: '10em'}}>Word</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Count</TableCell>
            <TableCell>Length</TableCell>
            <TableCell>Sentences</TableCell>
        </TableRow>
    </TableHead>
}