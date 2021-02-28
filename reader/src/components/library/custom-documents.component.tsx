import {Button, Paper, TextField} from "@material-ui/core";
import React from "react";
import {useObservableState} from "observable-hooks";
import {EditingDocument} from "../../lib/editing-documents/editing-document";

export const CustomDocumentsComponent: React.FunctionComponent<{ editingDocument: EditingDocument }> = ({editingDocument}) => {
    const rawText = useObservableState(editingDocument.text$) || '';
    const rawName = useObservableState(editingDocument.name$) || '';
    return <Paper>
        <div>
            <Button onClick={() => {
                editingDocument.saveSignal$.next()
            }}>Save</Button>
            <TextField
                label=""
                onChange={(ev) => editingDocument.name$.next(ev.target.value)}
                value={rawName}
            />
        </div>
        <textarea onChange={e => editingDocument.text$.next(e.target.value)} value={rawText} />
    </Paper>

}