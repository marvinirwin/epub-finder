import {Button, Paper, TextField} from "@material-ui/core";
import React from "react";
import {useObservableState} from "observable-hooks";
import {EditingDocument} from "../../lib/editing-documents/editing-document";

export const CustomBook: React.FunctionComponent<{ editingBook: EditingDocument }> = ({editingBook}) => {
    const rawText = useObservableState(editingBook.text$) || '';
    const rawName = useObservableState(editingBook.name$) || '';
    return <Paper>
        <div>
            <Button onClick={() => {
                editingBook.saveSignal$.next()
            }}>Save</Button>
            <TextField
                label=""
                onChange={(ev) => editingBook.name$.next(ev.target.value)}
                value={rawName}
            />
        </div>
        <textarea onChange={e => editingBook.text$.next(e.target.value)} value={rawText} />
    </Paper>

}