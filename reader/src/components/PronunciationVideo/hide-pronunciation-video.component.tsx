import {Fab} from "@material-ui/core";
import React, {useContext} from "react";
import {Close} from "@material-ui/icons";
import {ManagerContext} from "../../App";

export const HidePronunciationVideo = () => {
    const m = useContext(ManagerContext);
    return <Fab
        color="primary"
        aria-label="edit"
        style={{position: 'absolute', float: 'right', margin: '24px'}}
        onClick={() => m.settingsService.pronunciationVideoSentenceHash$.next('')}>
        <Close/>
    </Fab>
}