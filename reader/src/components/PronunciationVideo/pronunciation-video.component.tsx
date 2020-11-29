import {Card} from "@material-ui/core";
import React, {useContext, useState} from "react";
import {AudioRecorderResizedContext} from "../Main";
import {ManagerContext} from "../../App";
import {useRecordVideoTime} from "./useRecordVideoTime";
import {useSetTemporalPositionBar} from "./useSetTemporalPositionbar";
import {useSetVideoTime} from "./useSetVideoTime";
import {useRecordCurrentTime} from "./useRecordCurrentTime";
import {useApplyPlaybackSpeed} from "./useApplyPlaybackRate";
import {useApplyPlaybackTime} from "./useApplyPlaybackTime";
import {useObservableState} from "observable-hooks";
import {sha1} from "../../services/video.service";

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

    useSetTemporalPositionBar(videoElementRef, videoMetadata?.sentence, currentSentenceCharacterIndex, videoMetadata);
    useSetVideoTime(videoElementRef);
    useRecordCurrentTime(videoElementRef, highlightBarPosition1Ms, highlightBarPosition2Ms)
    useApplyPlaybackSpeed(videoElementRef);
    useApplyPlaybackTime(videoElementRef);

    const videoSource = videoMetadata ?
        `${process.env.PUBLIC_URL}/video/${sha1(videoMetadata.sentence)}`
        : undefined;

    return <video
        ref={el => m.pronunciationVideoService.videoRef$.next(el)}
        src={videoSource}
        autoPlay
        controls
        onCanPlay={() => resizeContext.next()}
    />
}
