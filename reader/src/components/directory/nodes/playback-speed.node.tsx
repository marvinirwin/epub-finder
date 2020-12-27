import {PlaybackSpeedComponent} from "../playback-speed.component";
import React from "react";

export function PlaybackSpeedNode() {
    return {
        name: 'playbackSpeed',
        label: 'playbackSpeed',
        InlineComponent: () => <PlaybackSpeedComponent/>
    };
}