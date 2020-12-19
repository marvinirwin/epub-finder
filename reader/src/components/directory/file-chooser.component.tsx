import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";

export const FileChooser = () => {
    const m = useContext(ManagerContext);
    const user = useObservableState(m.authManager.isLoggedIn$);
    return <input
        className={'file-chooser'}
        type={'file'}
        disabled={!user}
        accept=".pdf,.html,.txt,.docx"
        onChange={e => {
            const droppedFiles = e.target.files;
            droppedFiles && m.droppedFilesService.uploadFileRequests$.next([...droppedFiles]);
        }
        }/>
}