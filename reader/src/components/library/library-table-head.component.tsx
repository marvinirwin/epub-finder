import { TableCell, TableHead, TableRow} from "@material-ui/core";
import React from "react";

export const LibraryTableHead: React.FC<{}> = () => {
    return <TableHead>
        <TableRow>
            <TableCell style={{minWidth: '10em'}}>Word</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Use for Frequency</TableCell>
            <TableCell>Use for Reading</TableCell>
        </TableRow>
    </TableHead>
}