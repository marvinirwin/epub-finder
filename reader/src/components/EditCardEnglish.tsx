import {makeStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import {EditingCard} from "../lib/ReactiveClasses/EditingCard";
import {useObs} from "../lib/UseObs";
import React from 'react';

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
    const english = useObs(e.knownLanguage$);
    return (
        <form className={classes.root} noValidate autoComplete="off">
            <TextField
                id="outlined-multiline-static"
                label="Multiline"
                multiline
                rows={4}
                defaultValue="Default Value"
                variant="outlined"
                value={english}
                onChange={t => e.knownLanguage$.next(t.target.value.split('\n'))}
            />
        </form>
    );
}