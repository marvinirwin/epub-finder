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


export function BookContainer({rb, m}: { rb: RenderingBook, m: Manager }) {
    const ref = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = React.useState(true);

    /*
        const handleExpandClick = () => {
            setExpanded(!expanded);
        };
    */
    useEffect(() => {
        ref && ref.current && rb.renderRef$.next(ref.current);
    }, [ref])

    const translationText = useObs(rb.translationText$)

    return (
        <ExpansionPanelNoMargin defaultExpanded>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon/>}
                aria-controls="panel1c-content"
                id="panel1c-header"
            >
                <Typography>{rb.name}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <div id={rb.getId()} style={{width: '100%', height: '50%'}} ref={ref}/>
                    <p style={{whiteSpace: 'pre'}}>{translationText}</p>
                </Collapse>
            </ExpansionPanelDetails>
            <Divider/>
        </ExpansionPanelNoMargin>
    );
}