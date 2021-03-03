import React, {useContext, Fragment} from "react";
import {ManagerContext} from "../../App";
import {Box, Button, Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {BorderLinearProgressComponent} from "../progress/border-linear-progress.component";
import {fileChooser, uploadProgressBar} from "@shared/";


export const FileChooser = () => {
    const m = useContext(ManagerContext);
    const currentFile = useObservableState(m.uploadingDocumentsService.currentUploadingFile$)
    return <div>
        <div>
            <textarea>

            </textarea>
        </div>
        <div>
            <Typography
                variant={'h3'}
                color="textSecondary"
                gutterBottom
            >
                Upload Learning Material
            </Typography>
            <Typography
                variant="subtitle1"
                style={{margin: '24px'}}
            >
                Supported Extensions: docx, txt, pdf and html
            </Typography>
            <Typography
                variant="subtitle1"
                style={{margin: '24px'}}
            >
                Max Size: 1MB
            </Typography>
            <div className="mg20">
                {currentFile && (
                    <Box className={`mb25 ${uploadProgressBar}`} display="flex" alignItems="center">
                        <Box width="100%" mr={1}>
                            <BorderLinearProgressComponent/>
                        </Box>
                    </Box>)
                }

                <label htmlFor="btn-upload">
                    <input
                        id={fileChooser}
                        name="btn-upload"
                        style={{display: 'none'}}
                        type="file"
                        onChange={e => {
                            const droppedFiles = e.target.files;
                            if (droppedFiles) {
                                m.droppedFilesService.uploadFileRequests$.next([...droppedFiles]);
                            }
                        }}/>
                    <Button
                        className="btn-choose"
                        variant="outlined"
                        component="span">
                        Upload
                    </Button>
                </label>
            </div>

        </div>
    </div>
}