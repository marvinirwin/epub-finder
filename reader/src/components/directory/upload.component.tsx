import React, {useContext, Fragment} from "react";
import {ManagerContext} from "../../App";
import {Box, Button, CardActionArea, CardContent, ListItem, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useObservableState} from "observable-hooks";
import {BorderLinearProgress} from "../Progress/BorderLinearProgress";

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
    const currentFile = useObservableState(m.uploadingDocumentsService.currentUploadingFile$)
    return <Fragment>
        <CardContent>
            <Typography  className={classes.title} color="textSecondary" gutterBottom>
                Upload learning material
            </Typography>
            <Typography variant="h5" component="h2">
                Upload a document to learn to read (docx, .txt, .pdf) Maximum 1MB
            </Typography>
            <div className="mg20">
                {currentFile && (
                    <Box className="mb25" display="flex" alignItems="center">
                        <Box width="100%" mr={1}>
                            <BorderLinearProgress />
                        </Box>
                    </Box>)
                }

                <label htmlFor="btn-upload">
                    <input
                        id="btn-upload"
                        name="btn-upload"
                        style={{ display: 'none' }}
                        type="file"
                        onChange={e => {
                            const droppedFiles = e.target.files;
                            droppedFiles && m.droppedFilesService.uploadFileRequests$.next([...droppedFiles]);
                        }
                        } />
                    <Button
                        className="btn-choose"
                        variant="outlined"
                        component="span" >
                        Choose Files
                    </Button>
                </label>
{/*
                <div className="file-name">
                    {selectedFiles && selectedFiles.length > 0 ? selectedFiles[0].name : null}
                </div>
                <Button
                    className="btn-upload"
                    color="primary"
                    variant="contained"
                    component="span"
                    disabled={!selectedFiles}
                    onClick={this.upload}>
                    Upload
                </Button>
*/}

                <Typography variant="subtitle2" className={`upload-message ${"isError" ? "error" : ""}`}>
                    {"TODO"}
                </Typography>

                <Typography variant="h6" className="list-header">
                    List of Files
                </Typography>
                <ul className="list-group">
                </ul>
            </div >
        </CardContent>
        <CardActionArea>
            <input
                className={'file-chooser'}
                id={'file-chooser'}
                type={'file'}
                accept=".pdf,.html,.txt,.docx"
                onChange={e => {

                }}/>
        </CardActionArea>
    </Fragment>
}