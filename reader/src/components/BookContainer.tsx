import {RenderingBook} from "../lib/Books/Rendering/RenderingBook";
import React, {useEffect, useRef} from "react";
import Collapse from '@material-ui/core/Collapse';
import {Manager} from "../lib/Manager";
import {useObs} from "../UseObs";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Divider from "@material-ui/core/Divider";
import {ExpansionPanelNoMargin} from "./ExpansionPanelNoMargin";
import {IconButton, withStyles} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    collapse: {
        display: 'flex',
        flexFlow: 'row nowrap',
        height: '100%',
        '& > *': {
            flexGrow: 1
        }
    },
}));


const StyledCollapse = withStyles({
    container: {
        height: '100%'
    },
    wrapper: {
        height: '100%'
    },
    wrapperInner: {
        height: '100%'
    }
})(Collapse);


const StyledExpansionPanelDetails = withStyles({
    root: {
        height: '100%'
    }
})(ExpansionPanelDetails);

export function BookContainer({rb, m}: { rb: RenderingBook, m: Manager }) {
    const classes = useStyles();
    const ref = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = React.useState(true);
    useEffect(() => {
        ref && ref.current && rb.renderRef$.next(ref.current);
    }, [ref])

    const translationText = useObs(rb.translationText$)

    return (
        <ExpansionPanelNoMargin defaultExpanded className={"book-expansion-panel"}>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon/>}
                aria-controls="panel1c-content"
                id="panel1c-header"
            >
                <div style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between', width: '100%', }}>
                    <Typography variant={'h6'}>{rb.name}</Typography>
                    <IconButton onClick={() => m.requestBookRemove$.next(rb)}>
                        <DeleteIcon/>
                    </IconButton>
                </div>
            </ExpansionPanelSummary>
            <StyledExpansionPanelDetails>
                <StyledCollapse in={expanded} timeout="auto" unmountOnExit>
                    <div id={rb.getId()} ref={ref}/>
                    <p style={{whiteSpace: 'pre'}}>{translationText}</p>
                </StyledCollapse>
            </StyledExpansionPanelDetails>
        </ExpansionPanelNoMargin>
    );
}