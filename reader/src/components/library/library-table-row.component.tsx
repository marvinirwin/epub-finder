import React, {useContext} from 'react'
import {LibraryDocumentRow} from '../../lib/manager/library-document-row'
import {Button, TableCell, TableRow, Typography} from '@material-ui/core'
import Checkbox from '@material-ui/core/Checkbox'
import {ManagerContext} from '../../App'
import {useObservableState} from 'observable-hooks'
import {libraryRow, libraryRowDelete, libraryRowToggleExample, libraryRowToggleFrequency,} from '@shared/'

export const LibraryDocumentRowComponent: React.FC<{
    document: LibraryDocumentRow
}> = ({ document }) => {
    const m = useContext(ManagerContext)
    const frequencyDocuments = useObservableState(
        m.settingsService.selectedFrequencyDocuments$.obs$,
    )
    const exampleSentences = useObservableState(
        m.settingsService.selectedExampleSegmentDocuments$.obs$,
    )
    return (
        <TableRow
            id={document.ltDocument.name}
            className={libraryRow}
            onClick={(e) => {
                if (e.metaKey) {
                    m.settingsService.readingDocument$.user$.next(
                        document.ltDocument.id(),
                    )
                }
            }}
        >
            <TableCell><Typography variant='h6'>{document.ltDocument.d.name}</Typography></TableCell>
            <TableCell>
                <Checkbox
                    className={libraryRowToggleFrequency}
                    checked={
                        !!frequencyDocuments?.includes(document.ltDocument.id())
                    }
                    onChange={() => document.toggleUseForFrequency()}
                />
            </TableCell>
            <TableCell>
                <Checkbox
                    className={libraryRowToggleExample}
                    checked={
                        !!exampleSentences?.includes(document.ltDocument.id())
                    }
                    onChange={() => document.toggleUseForExamples()}
                />
            </TableCell>
            {/*
        <TableCell>
            <Checkbox
                className={libraryRowToggleReading}
                checked={readingDocument === document.ltDocument.id()}
                onChange={() => document.toggleReading()}
            />
        </TableCell>
*/}
            <TableCell>
                <Button
                    className={libraryRowDelete}
                    onClick={() => document.delete()}
                >
                    Delete
                </Button>
            </TableCell>
        </TableRow>
    )
}
