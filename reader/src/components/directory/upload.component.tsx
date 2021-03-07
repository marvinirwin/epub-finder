import React, {useContext, Fragment, useState} from "react";
import {ManagerContext} from "../../App";
import {Box, Button, Input, Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {BorderLinearProgressComponent} from "../progress/border-linear-progress.component";
import {fileChooser, uploadProgressBar, uploadTextArea, uploadTextButton, uploadTextName} from "@shared/";


export const UploadText = () => {
    const m = useContext(ManagerContext);
    const [text, setText] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    return <div>
        <Typography
            variant={'h5'}
            color="textSecondary"
            gutterBottom
        >
            Use text as learning material
        </Typography>
        <Input
            value={title}
            onChange={v => setTitle(v.target.value || '')}
            placeholder={'name'}
            inputProps={{id: uploadTextName}}
        />
        <textarea
            style={{width: '500px', height: '240px'}}
            onChange={v => setText(v.target.value || '')}
            value={text}
            id={uploadTextArea}
        />
        <Button
            onClick={
                () => m
                    .droppedFilesService
                    .uploadFileRequests$
                    .next([new File([text], `${title}.txt`)])
            }
            id={uploadTextButton}
        >
            Upload Text
        </Button>
    </div>
}

export const FileChooser = () => {
    const m = useContext(ManagerContext);
    const currentFile = useObservableState(m.uploadingDocumentsService.currentUploadingFile$)
    return <div>
        <UploadText/>
        <div>
            <Typography
                variant={'h5'}
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