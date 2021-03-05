import React, {useContext} from "react";
import {ManagerContext} from "../../../App";
import {SignupLogin} from "./signup-login.component";
import {ManualMouseover} from "./manual-mouseover.component";
import {ManualHotkey} from "./manual-hotkey.component";
import {ManualQuizHiddenFields} from "./manual-quiz-hidden-fields.component";

export const ManualTestModal = () => {
    const m = useContext(ManagerContext);
    return <div>
        <SignupLogin/>
        <button id='clear-speech-recognition-rows'
                onClick={() => m.pronunciationProgressService.clearRecords$.next()}>
            Clear speech recognition rows
        </button>
        <ManualMouseover/>
        <ManualHotkey/>
        <ManualQuizHiddenFields/>
    </div>
};