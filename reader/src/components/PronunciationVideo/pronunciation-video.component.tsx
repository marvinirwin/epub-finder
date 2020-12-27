import {Card} from "@material-ui/core";
import React, {useContext, useState} from "react";
import {AudioRecorderResizedContext} from "../Main";
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
    const currentSentenceCharacterIndex = useObservableState(m.inputManager.videoCharacterIndex$);

    useApplyTimeBySelectedCharacter(videoElementRef, videoMetadata?.sentence, currentSentenceCharacterIndex, videoMetadata);
    useApplyBoundedTime(videoElementRef, highlightBarPosition1Ms, highlightBarPosition2Ms)
    useApplyPlaybackSpeed(videoElementRef);
    useApplyPlaybackTime(videoElementRef);
    useObserveVideoState(videoElementRef, m.pronunciationVideoService);


    const videoSource = videoMetadata ?
        `${process.env.PUBLIC_URL}/video/${videoMetadata.filename}`
        : undefined;

    return <video
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