import React, {useEffect, useRef, useState} from "react";
import Collapse from '@material-ui/core/Collapse';
import {Manager} from "../../lib/Manager";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import {withStyles} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {BookFrame} from "../../lib/BookFrame/BookFrame";

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

export function AtomizedFrameContainer({rb, m}: { rb: BookFrame, m: Manager }) {
    const classes = useStyles();
    const [ref, setRef] = useState();
    const [expanded, setExpanded] = React.useState(true);
    useEffect(() => {
        ref && rb.ref$.next(ref);
    }, [ref, rb]);

/*
    const translationText = useObservableState(rb.translationText$)
*/

    return (
        <div style={{width: '100%', height: '100%'}} id={rb.getRenderParentElementId()} ref={setRef}/>
    );
}