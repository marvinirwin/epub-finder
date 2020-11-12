import {useEffect, useState} from "react";
import {useInterval} from "./useInterval";

export const useVideoTime = (videoElementRef: HTMLVideoElement | null | undefined) => {
    const [videoTime, setVideoTime] = useState<undefined | number>(undefined);

    useInterval(() => {
        if (videoElementRef) {
            setVideoTime(videoElementRef.currentTime * 1000)
        }
    }, 100);

    return videoTime;
}