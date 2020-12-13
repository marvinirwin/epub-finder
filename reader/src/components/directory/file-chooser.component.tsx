import React, {useContext} from "react";
import {DropZoneContext, ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";

export const FileChooser = () => {
    const m = useContext(ManagerContext);
    const user = useObservableState(m.authManager.profile$);
    const {getInputProps} = useContext(DropZoneContext) || {};
    return <input {...getInputProps?.()} type={'file'} disabled={!user} accept=".pdf,.html,.txt" />
}