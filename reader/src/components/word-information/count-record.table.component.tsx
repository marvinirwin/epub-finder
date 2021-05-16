import React from 'react'
import { DocumentWordCount } from '../../../../server/src/shared/DocumentWordCount'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core'

export const CountRecordTable: React.FC<{
    countRecords: DocumentWordCount[],
}> = ({ countRecords }) => {
    return (
        <TableContainer component={Paper}>
            <Table size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell>Document</TableCell>
                        <TableCell align='right'>Count</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {countRecords.map((row) => (
                        <TableRow
                            key={`${row.document}${row.word}${row.count}`}
                        >
                            <TableCell component='th' scope='row'>
                                {row.document}
                            </TableCell>
                            <TableCell align='right'>{row.count}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}