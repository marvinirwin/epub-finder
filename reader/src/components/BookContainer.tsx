import {RenderingBook} from "../lib/Books/Rendering/RenderingBook";
import React, {useEffect, useRef} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { red } from '@material-ui/core/colors';
import DeleteIcon from '@material-ui/icons/Delete';
import {CardActions, CardContent} from "@material-ui/core";
import {Manager} from "../lib/Manager";
import {useObs} from "../UseObs";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import EditingCardComponent from "./EditingCard/EditingCardComponent";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles((theme) => ({
    root: {
        minWidth: '100%'
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    avatar: {
        backgroundColor: red[500],
    },
}));


export function BookContainer({rb, m}: { rb: RenderingBook, m: Manager}) {
    const ref = useRef<HTMLDivElement>(null);
    const classes = useStyles();
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
        <ExpansionPanel defaultExpanded>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1c-content"
                id="panel1c-header"
            >
                <div>
                    <Typography>Current Card</Typography>
                </div>
                <div>
                    <Typography>Current Card</Typography>
                </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <Card className={classes.root}>
                    <CardHeader
                        avatar={
                            <Avatar aria-label="Book Name" className={classes.avatar}>
                                {rb.name}
                            </Avatar>
                        }
                        action={
                            <IconButton aria-label="settings" onClick={() => m.requestBookRemove$.next(rb)}>
                                <DeleteIcon />
                            </IconButton>
                        }
                        title={rb.name}
                    />
                    <CardActions disableSpacing>
                    </CardActions>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <CardContent>
                            <div id={rb.getId()} style={{width: '100%', height: '50%'}} ref={ref}/>
                            <p style={{whiteSpace: 'pre'}}>{translationText}</p>
                        </CardContent>
                    </Collapse>
                </Card>
            </ExpansionPanelDetails>
            <Divider />
        </ExpansionPanel>
    );
}