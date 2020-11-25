import {useEffect, useState} from "react";
import {useInterval} from "./useInterval";
import {PronunciationVideoService} from "./pronunciation-video.service";
import {useObservableState} from "observable-hooks";

export const useVideoTime = (
    videoElementRef: HTMLVideoElement | null | undefined,
    pronunciationVideoService: PronunciationVideoService
) => {

    useInterval(() => {
        if (videoElementRef) {
            pronunciationVideoService.videoPlaybackTime$.next(videoElementRef.currentTime * 1000);
            pronunciationVideoService.playing$.next(
                !videoElementRef.paused &&
                !videoElementRef.ended &&
                !!videoElementRef.duration
            );
        }
    }, 100);

    const videoTime = useObservableState(pronunciationVideoService.videoPlaybackTime$);


    return videoTime;
}