import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Manager} from "../lib/Manager";

const useStyles = makeStyles((theme) => ({
    topPopups: {
        position: 'static',
        maxHeight: '90vh',
        minHeight: '90vh',
        display: 'flex',

        '& > .MuiExpansionPanel-root.Mui-expanded': {
            borderRadius: 0
        },
        '& > *': {
            width: '100%',
            flexGrow: 1
        },
    },
    icon: {
        verticalAlign: 'bottom',
        height: 20,
        width: 20,
    },
    helper: {
        borderLeft: `2px solid ${theme.palette.divider}`,
        padding: theme.spacing(1),
    },
    link: {
        color: theme.palette.primary.main,
        textDecoration: 'none',
        '&:hover': {
            textDecoration: 'underline',
        },
    },
}));

export default function Popups({m}: {m: Manager}) {
    const classes = useStyles();


    return (
        <div className={classes.topPopups}>

{/*
            <WordCountTable m={m}/>
*/}
        </div>
    );
}