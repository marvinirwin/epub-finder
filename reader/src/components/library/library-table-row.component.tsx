import React, {useContext} from "react";
import {LibraryDocumentRow} from "../../lib/manager/library-document-row";
import {TableCell, TableRow} from "@material-ui/core";
import Checkbox from '@material-ui/core/Checkbox';
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";


export const LibraryDocumentRowComponent: React.FC<{ document: LibraryDocumentRow }> = ({document}) => {
    const m = useContext(ManagerContext);
    const frequencyDocuments = useObservableState(m.settingsService.selectedFrequencyDocuments$);
    const readingDocument = useObservableState(m.settingsService.readingDocument$);
    return <TableRow>
        <TableCell>
            {document.ltDocument.d.name}
        </TableCell>
        <TableCell>
            <Checkbox
                checked={frequencyDocuments?.includes(document.ltDocument.id())}
                onChange={() => document.toggleUseForFrequency()}
            />
        </TableCell>
        <TableCell>
            <Checkbox
                checked={readingDocument === document.ltDocument.id()}
                onChange={() => document.toggleReading()}
            />
        </TableCell>
        <TableCell>
            <Checkbox
                checked={document.ltDocument.d.deleted}
                onChange={() => document.toggleDeleted()}
            />
        </TableCell>
    </TableRow>
}