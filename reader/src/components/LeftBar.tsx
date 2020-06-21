import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import {Manager} from "../lib/Manager";
import {useObs} from "../UseObs";
import EditingCardComponent from "./EditingCard/EditingCardComponent";
import WordCountTable from "./WordCountTable";
import {FlashcardPopup} from "./FlashcardPopup";
import QuickDIalogContainer from "./QuizPopup";
import TableContainer from "@material-ui/core/TableContainer";

const useStyles = makeStyles((theme) => ({
    leftBarRoot: {
        maxHeight: '90vh',
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',

        '& > .MuiExpansionPanel-root.Mui-expanded': {
            borderRadius: 0
        },
        '& > *': {
            width: '100%',
            flexGrow: 1
        },
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    icon: {
        verticalAlign: 'bottom',
        height: 20,
        width: 20,
    },
    details: {
        width: '100%',
        alignItems: 'center',
    },
    column: {
        flexBasis: '33.33%',
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

export default function LeftBar({m}: {m: Manager}) {
    const classes = useStyles();

    const editingCard = useObs(m.currentEditingCard$);
    return (
        <div className={classes.leftBarRoot}>
            <QuickDIalogContainer m={m}/>
            <ExpansionPanel defaultExpanded>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1c-content"
                    id="panel1c-header"
                >
                    <div className={classes.column}>
                        <Typography className={classes.heading}>Current Card</Typography>
                    </div>
                    <div className={classes.column}>
                        <Typography className={classes.secondaryHeading}>Current Card</Typography>
                    </div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                    {editingCard ? (<EditingCardComponent card={editingCard}/>) : (<div>No card found</div>)}
                </ExpansionPanelDetails>
                <Divider />
            </ExpansionPanel>
            <WordCountTable m={m}/>
        </div>
    );
}