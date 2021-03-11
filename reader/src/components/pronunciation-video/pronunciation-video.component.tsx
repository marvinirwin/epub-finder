import React, {useContext, useState} from "react";
import {AudioRecorderResizedContext} from "../main";
import {ManagerContext} from "../../App";
import {useObserveVideoState} from "./useObserveVideoState";
import {useApplyTimeBySelectedCharacter} from "./useApplyTimeBySelectedCharacter";
import {useApplyBoundedTime} from "./useApplyBoundedTime";
import {useApplyPlaybackSpeed} from "./useApplyPlaybackRate";
import {useApplyPlaybackTime} from "./useApplyPlaybackTime";
import {useObservableState} from "observable-hooks";

export const PronunciationVideo = (
    {
        highlightBarPosition1Ms,
        highlightBarPosition2Ms
    }: {
        highlightBarPosition1Ms: number | undefined,
        highlightBarPosition2Ms: number | undefined,
        currentSentenceCharacterIndex: number | undefined
    }
) => {
    const m = useContext(ManagerContext);
    const resizeContext = useContext(AudioRecorderResizedContext);
    const videoElementRef = useObservableState(m.pronunciationVideoService.videoRef$);
    const videoMetadata = useObservableState(m.pronunciationVideoService.videoMetadata$)

    useApplyTimeBySelectedCharacter(videoElementRef, videoMetadata?.sentence, videoMetadata);
    useApplyBoundedTime(videoElementRef, highlightBarPosition1Ms, highlightBarPosition2Ms)
    useApplyPlaybackSpeed(videoElementRef);
    useApplyPlaybackTime(videoElementRef);
    useObserveVideoState(videoElementRef, m.pronunciationVideoService);


    const videoSource = videoMetadata ?
        `${process.env.PUBLIC_URL}/video/${videoMetadata.filename}`
        : undefined;

    return <video
        id={'pronunciation-video'}
        ref={el => m.pronunciationVideoService.videoRef$.next(el)}
        src={videoSource}
        autoPlay
        controls
        onCanPlay={() => {
            resizeContext.next();
            m.pronunciationVideoService.canPlay$.next(true);
        }}
    />
}
