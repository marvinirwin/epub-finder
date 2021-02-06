import {Slider, TextField, Typography} from "@material-ui/core";
import React, {useContext, Fragment} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";

export function PlaybackSpeedComponent() {
    const m = useContext(ManagerContext);
    const playbackRate = useObservableState(m.settingsService.playbackSpeed$.obs$, 0.5);
    return <div  ref={el => m.introService.playbackSpeedRef$.next(el)}>
        <Typography gutterBottom>
            Video playback speed
        </Typography>
        <Slider
            id={'playback-speed-slider'}
            value={playbackRate}
            onChange={(_, value) => {
                m.settingsService.playbackSpeed$.next(value as number);
            }}
            step={.1}
            marks
            min={0.1}
            max={1}
        />
    </div>
}
