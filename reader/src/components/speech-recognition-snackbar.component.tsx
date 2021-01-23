import {Paper, Snackbar, SnackbarContent} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import React, {useContext} from "react";
import {ManagerContext} from "../App";
import {useObservableState} from "observable-hooks";
import {LatestRecognizedText} from "./latest-recognized-text.component";

export const SpeechRecognitionSnackbar = () => {
    const m = useContext(ManagerContext);
    const recognizedText = useObservableState(m.audioManager.audioRecorder.currentRecognizedText$, '');
    return <Snackbar
        open={!!recognizedText}
        autoHideDuration={10000}
        onClose={() => {
        }}
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
    >
        <Paper style={{padding: '12px', minWidth: '480px'}}>
            <LatestRecognizedText/>
        </Paper>
    </Snackbar>
}