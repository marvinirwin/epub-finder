import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {ListItem, Typography} from "@material-ui/core";

export const FileChooser = () => {
    const m = useContext(ManagerContext);
    return <ListItem style={{display: 'flex', flexFlow: 'column nowrap'}}>
        <Typography variant="overline">Upload learning material (docx, .txt, .pdf)</Typography>
        <input
            className={'file-chooser'}
            id={'file-chooser'}
            type={'file'}
            accept=".pdf,.html,.txt,.docx"
            onChange={e => {
                const droppedFiles = e.target.files;
                droppedFiles && m.droppedFilesService.uploadFileRequests$.next([...droppedFiles]);
            }
            }/>
    </ListItem>
}