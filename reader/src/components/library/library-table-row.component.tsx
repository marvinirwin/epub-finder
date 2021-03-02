import React from "react";
import {LibraryDocumentRow} from "../../lib/manager/library-document-row";
import {TableCell, TableRow} from "@material-ui/core";
import Checkbox from '@material-ui/core/Checkbox';


export const LibraryDocumentRowComponent: React.FC<{ document: LibraryDocumentRow }> = ({document}) => {
    return <TableRow>
        <TableCell>
            {document.ltDocument.d.name}
        </TableCell>
        <TableCell>
            <Checkbox
                checked={document.ltDocument.d.for_frequency}
                onChange={() => document.toggleUseForFrequency()}
            />
        </TableCell>
        <TableCell>
            <Checkbox
                checked={document.ltDocument.d.for_reading}
                onChange={() => document.toggleReading()}
            />
        </TableCell>
    </TableRow>
}