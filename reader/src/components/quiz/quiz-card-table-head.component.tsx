import { TableCell, TableHead, TableRow} from "@material-ui/core";
import React from "react";

export const QuizCardTableHead: React.FC<{}> = () => {
    return <TableHead>
        <TableRow>
            <TableCell style={{minWidth: '10em'}}>Word</TableCell>
            <TableCell>Sort Weight</TableCell>
            <TableCell>Due In</TableCell>
            <TableCell>Recognition</TableCell>
            <TableCell>Frequency</TableCell>
            <TableCell>Pronunciation</TableCell>
        </TableRow>
    </TableHead>
}