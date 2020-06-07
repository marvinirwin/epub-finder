import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import {Manager} from "../managers/Manager";
import {useObs} from "../UseObs";
import EditingCard from "./EditingCard";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > .MuiExpansionPanel-root.Mui-expanded': {
            borderRadius: 0
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
        alignItems: 'center',
    },
    column: {
        flexBasis: '33.33%',
    },
    helper: {
        borderLeft: `2px solid ${theme.palette.divider}`,
        padding: theme.spacing(1, 2),
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

    const editingCard = useObs(m.cardInEditor$);
    return (
        <div className={classes.root}>
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
                    {editingCard ? (<EditingCard card={editingCard}/>) : (<div>No card found</div>)}
                </ExpansionPanelDetails>
                <Divider />
            </ExpansionPanel>
        </div>
    );
}