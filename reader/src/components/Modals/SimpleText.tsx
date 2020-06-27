import React, {FunctionComponent} from "react";
import {Manager} from "../../lib/Manager/Manager";
import {useObs} from "../../UseObs";
import {SimpleText} from "../../lib/Books/SimpleText";
import {TextareaAutosize, TextField} from "@material-ui/core";
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';

export function SimpleTextModal({m}: { m: Manager }) {
    const simpleTextInput = useObs(m.simpleTextInput$);
    const simpleTextTitle = useObs(m.simpleTextTitle$);
    const open = useObs(m.simpleTextDialogOpen$);
    return <SimpleDialog open={!!open} setOpen={b => m.simpleTextDialogOpen$.next(b)}>
        <form noValidate autoComplete="off">
            <TextField value={simpleTextTitle} onChange={v => m.simpleTextTitle$.next(v.target.value)}/>
            <TextareaAutosize
                aria-label=""
                placeholder=""
                value={simpleTextInput}
                onChange={v => m.simpleTextInput$.next(v.target.value)}
            />
            <Button onClick={() => {
                m.bookLoadUpdates$.next(new SimpleText(simpleTextTitle || '', simpleTextInput || ''));
                m.simpleTextDialogOpen$.next(false);
            }}>Add Resource</Button>
        </form>
    </SimpleDialog>;
}

export interface SimpleDialogProps {
    open: boolean;
    setOpen: (b: boolean) => void
}

const SimpleDialog: FunctionComponent<SimpleDialogProps> = ({open, children, setOpen}) => {
    return <Dialog onClose={() => setOpen(false)} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle id="simple-dialog-title">TODO Title</DialogTitle>
        {children}
    </Dialog>
}

