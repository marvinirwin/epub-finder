import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableContainer,
} from '@material-ui/core'
import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { LtDocument } from '@shared/'
import { LibraryTableHead } from './library-table-head.component'
import { LibraryDocumentRow } from '../../lib/manager/library-document-row'
import { LibraryDocumentRowComponent } from './library-table-row.component'


export const LibraryTableAddText = () => {
    const m = useContext(ManagerContext);
    return <Box m={2} p={1}>
        <Button
            variant={'contained'}
            onClick={() => {
                m.modalService.fileUpload.open$.next(true)
            }}
        >
            Upload Learning Material
        </Button>
    </Box>
}
export const LibraryTable: React.FC = ({children}) => {
    const m = useContext(ManagerContext)
    const readingDocuments =
        useObservableState(m.documentRepository.collection$) || new Map()
    return (
        <TableContainer
            component={Paper}
            style={{flex: 1}}
        >
            {children}
            <Table size="small">
                <LibraryTableHead />
                <TableBody>
                    {[...readingDocuments.values()].map(
                        (document: LtDocument) => (
                            <LibraryDocumentRowComponent
                                key={document.id()}
                                document={
                                    new LibraryDocumentRow({
                                        settingsService: m.settingsService,
                                        ltDocument: document,
                                        frequencyDocumentRepository:
                                            m.frequencyDocumentsRepository,
                                        readingDocumentRepository:
                                            m.documentRepository,
                                    })
                                }
                            />
                        ),
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
