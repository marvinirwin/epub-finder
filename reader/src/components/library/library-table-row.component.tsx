import React, {useContext} from "react";
import {LibraryDocumentRow} from "../../lib/manager/library-document-row";
import {TableCell, TableRow, Button} from "@material-ui/core";
import Checkbox from '@material-ui/core/Checkbox';
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {libraryRow, libraryRowDelete, libraryRowToggleFrequency, libraryRowToggleReading} from "@shared/";


export const LibraryDocumentRowComponent: React.FC<{ document: LibraryDocumentRow }> = ({document}) => {
    const m = useContext(ManagerContext);
    const frequencyDocuments = useObservableState(m.settingsService.selectedFrequencyDocuments$);
    const readingDocument = useObservableState(m.settingsService.readingDocument$);
    return <TableRow id={document.ltDocument.name} className={libraryRow}>
        <TableCell>
            {document.ltDocument.d.name}
        </TableCell>
        <TableCell>
            <Checkbox
                className={libraryRowToggleFrequency}
                checked={!!frequencyDocuments?.includes(document.ltDocument.id())}
                onChange={() => document.toggleUseForFrequency()}
            />
        </TableCell>
        <TableCell>
            <Checkbox
                className={libraryRowToggleReading}
                checked={readingDocument === document.ltDocument.id()}
                onChange={() => document.toggleReading()}
            />
        </TableCell>
        <TableCell>
            <Button
                className={libraryRowDelete}
                onClick={() => document.delete()}
            >Delete</Button>
        </TableCell>
    </TableRow>
}