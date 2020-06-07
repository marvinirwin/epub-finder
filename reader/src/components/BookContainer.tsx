import {RenderingBook} from "../managers/RenderingBook";
import React, {useEffect, useRef} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Collapse from '@material-ui/core/Collapse';
import clsx from 'clsx';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { red } from '@material-ui/core/colors';
import DeleteIcon from '@material-ui/icons/Delete';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {CardActions, CardContent} from "@material-ui/core";

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


export function BookContainer({rb}: { rb: RenderingBook }) {
    const ref = useRef<HTMLDivElement>(null);
    const classes = useStyles();
    const [expanded, setExpanded] = React.useState(true);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };
    useEffect(() => {
        ref && ref.current && rb.renderRef$.next(ref.current);
    }, [ref])

    return (
        <Card className={classes.root}>
            <CardHeader
                avatar={
                    <Avatar aria-label="Book Name" className={classes.avatar}>
                        {rb.type}
                    </Avatar>
                }
                action={
                    <IconButton aria-label="settings">
                        <DeleteIcon />
                    </IconButton>
                }
                title={rb.type}
            />
            <CardActions disableSpacing>
{/*
                <IconButton
                    className={clsx(classes.expand, {
                        [classes.expandOpen]: expanded,
                    })}
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                >
                    <ExpandMoreIcon />
                </IconButton>
*/}
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <div id={rb.getId()} style={{width: '100%', height: '50%'}} ref={ref}/>
                </CardContent>
            </Collapse>
        </Card>
    );
}