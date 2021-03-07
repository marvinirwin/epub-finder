import {Paper, Table, TableBody, TableContainer} from "@material-ui/core";
import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {LtDocument} from "@shared/";
import {LibraryTableHead} from "./library-table-head.component";
import {LibraryDocumentRow} from "../../lib/manager/library-document-row";
import {LibraryDocumentRowComponent} from "./library-table-row.component";
import uniqueBy from "@popperjs/core/lib/utils/uniqueBy";


export const LibraryTable = () => {
    const m = useContext(ManagerContext);
    const frequencyDocuments = useObservableState(m.frequencyDocumentsRepository.all$) || new Map();
    const readingDocuments = useObservableState(m.documentRepository.collection$) || new Map();
    return <TableContainer component={Paper}>
        <Table size='small'>
            <LibraryTableHead/>
            <TableBody>
                {
                    uniqueBy(
                        [...[...frequencyDocuments.values()].map(d => d.frequencyDocument), ...readingDocuments.values()],
                        (v: LtDocument) => v.id())
                        .map((document: LtDocument) => <LibraryDocumentRowComponent
                            key={document.id()}
                            document={new LibraryDocumentRow({
                                settingsService: m.settingsService,
                                ltDocument: document,
                                frequencyDocumentRepository: m.frequencyDocumentsRepository,
                                readingDocumentRepository: m.documentRepository
                            })}
                        />)
                }
            </TableBody>
        </Table>
    </TableContainer>
}