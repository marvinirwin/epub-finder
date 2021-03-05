import React, {useContext} from "react";
import {useObservableState} from "observable-hooks";
import {ManagerContext} from "../../../App";

export const ManualIsRecording = () => {
    const m = useContext(ManagerContext);
    const manualIsRecording = useObservableState(m.settingsService.manualIsRecording$) || false;
    return <input id='manual-is-recording' type="check" checked={manualIsRecording}/>
}