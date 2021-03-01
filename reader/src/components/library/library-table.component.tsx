import {Paper, Table, TableBody, TableCell, TableContainer, TableRow} from "@material-ui/core";
import {QuizCardTableHead} from "../quiz/quiz-card-table-head.component";
import {QuizCardTableRow} from "../quiz/quiz-card-table-row.component";
import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {LtDocument} from "@shared/";
import {LibraryTableHead} from "./library-table-head.component";


const LibraryDocumentRow: React.FC<{document: LtDocument}> = ({document}) => {
    return <TableRow>
        <TableCell>
            {document.name}
        </TableCell>
        <TableCell>
            {document.d.for_frequency}
        </TableCell>
        <TableCell>
            {document.d.for_frequency}
        </TableCell>
        <TableCell>
            {document.d.for_reading}
        </TableCell>
    </TableRow>
}


export const LibraryTable = () => {
    const m = useContext(ManagerContext);
    const frequencyDocuments = useObservableState(m.frequencyDocumentsRepository.all$) || new Map();
    const readingDocuments = useObservableState(m.documentRepository.collection$) || new Map();
    return <TableContainer component={Paper}>
        <Table>
            <LibraryTableHead/>
            <TableBody>
                {
                    [...[...frequencyDocuments.values()].map(d => d.frequencyDocument), ...readingDocuments.values()]
                        .map((document: LtDocument) => <LibraryDocumentRow document={document}/>)
                }
            </TableBody>
        </Table>
    </TableContainer>
}