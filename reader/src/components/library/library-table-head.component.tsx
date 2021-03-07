import { TableCell, TableHead, TableRow} from "@material-ui/core";
import React from "react";

export const LibraryTableHead: React.FC<{}> = () => {
    return <TableHead>
        <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Use for Frequency</TableCell>
            <TableCell>Read</TableCell>
            <TableCell>Delete</TableCell>
        </TableRow>
    </TableHead>
}