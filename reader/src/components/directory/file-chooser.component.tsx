import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";

export const FileChooser = () => {
    const m = useContext(ManagerContext);
    const user = useObservableState(m.authManager.profile$);
    return <input className={'file-chooser'} type={'file'} disabled={!user} accept=".pdf,.html,.txt" />
}