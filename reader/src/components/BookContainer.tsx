import {PageRenderer} from "../lib/Books/Rendering/PageRenderer";
import React, {useEffect, useRef} from "react";
import Collapse from '@material-ui/core/Collapse';
import {Manager} from "../lib/Manager";
import {useObs} from "../lib/UseObs";
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

export function BookContainer({rb, m}: { rb: PageRenderer, m: Manager }) {
    const classes = useStyles();
    const ref = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = React.useState(true);
    useEffect(() => {
        ref && ref.current && rb.renderRef$.next(ref.current);
    }, [ref])

/*
    const translationText = useObs(rb.translationText$)
*/

    return (
        <div style={{width: '100%', height: '100%'}} id={rb.getRenderParentElementId()} ref={ref}/>
    );
}