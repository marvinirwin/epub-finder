import {IconButton, Paper, Snackbar, SnackbarContent} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import React, {useContext, useState} from "react";
import {ManagerContext} from "../App";
import {useObservableState, useSubscription} from "observable-hooks";
import {LatestRecognizedText} from "./latest-recognized-text.component";
import CloseIcon from "@material-ui/icons/Close";

export const SpeechRecognitionSnackbar = () => {
    const m = useContext(ManagerContext);
    const [latestRecognizedText, setLatestRecognizedText,] = useState<string>('')
    useSubscription(
        m.audioRecordingService.audioRecorder.currentRecognizedText$,
        v => v && setLatestRecognizedText(v)
    )

    function close() {
        setLatestRecognizedText('');
    }

    return <Snackbar
        open={!!latestRecognizedText}
        autoHideDuration={10000}
        onClose={close}
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
    >
        <Paper style={{
            padding: '12px',
            minWidth: '480px',
            display: 'flex',
            flexFlow: 'row nowrap',
            justifyContent: 'space-between'
        }}>
            <div>
                <LatestRecognizedText/>
            </div>
            <div>
                <IconButton size="small" aria-label="close" color="inherit" onClick={close}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>
        </Paper>
    </Snackbar>
}