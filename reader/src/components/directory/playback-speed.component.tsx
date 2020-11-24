import {Manager} from "../../lib/Manager";
import {Slider, TextField} from "@material-ui/core";
import React, {useContext} from "react";
import {debounce} from 'lodash';
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";

export function PlaybackSpeedComponent() {
    const m = useContext(ManagerContext);
    const playbackRate = useObservableState(m.settingsService.playbackSpeed$)
    return <Slider
        value={playbackRate}
        onChange={e => {
            debugger;
            // @ts-ignore
            m.settingsService.playbackSpeed$.next(e.target.value);
        }}
        step={.1}
        marks
        min={0.1}
        max={1}
    />
}
