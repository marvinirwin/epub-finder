import React, {useContext, Fragment} from "react";
import {ManagerContext} from "../../App";
import {CardActionArea, CardContent, ListItem, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles({
    root: {
        minWidth: 275,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
});

export const FileChooser = () => {
    const classes = useStyles();
    const m = useContext(ManagerContext);
    return <Fragment>
        <CardContent>
            <Typography  className={classes.title} color="textSecondary" gutterBottom>
                Upload learning material
            </Typography>
            <Typography variant="h5" component="h2">
                Upload a document to learn to read (docx, .txt, .pdf) Maximum 1MB
            </Typography>
        </CardContent>
        <CardActionArea>
            <input
                className={'file-chooser'}
                id={'file-chooser'}
                type={'file'}
                accept=".pdf,.html,.txt,.docx"
                onChange={e => {
                    const droppedFiles = e.target.files;
                    droppedFiles && m.droppedFilesService.uploadFileRequests$.next([...droppedFiles]);
                }}/>
        </CardActionArea>
    </Fragment>
}