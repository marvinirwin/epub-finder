import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import {Manager} from "../lib/Manager";
import {useObs} from "../lib/UseObs";
import EditingCardComponent from "./EditingCard/EditingCardComponent";
import WordCountTable from "./WordCountTable";
import QuizDialogContainer from "./QuizPopup";
import {ExpansionPanelNoMargin} from "./ExpansionPanelNoMargin";
import {AudioRecordingPopup} from "./AudioRecordingPopup";

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