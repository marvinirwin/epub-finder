import {makeStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import {EditingCard} from "../../lib/reactive-classes/EditingCard";
import React from 'react';
import {useObservableState} from "observable-hooks";

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: '100%',
        },
    },
}));

export default function EditCardEnglish({e}: { e: EditingCard }) {
    const classes = useStyles();
    const knownLanguage = useObservableState(e.knownLanguage$);
    return (
        <form className={classes.root} noValidate autoComplete="off">
            <TextField
                id="outlined-multiline-static"
                label="Multiline"
                multiline
                rows={4}
                variant="outlined"
                value={knownLanguage ? knownLanguage.join('\n') : ''}
                onKeyDown={t => {
                    t.stopPropagation();
                }}
                onChange={t => {
                    t.preventDefault();
                    t.stopPropagation();
                    e.knownLanguage$.next(t.target.value.split('\n'));
                }}
            />
        </form>
    );
}