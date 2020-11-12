import {useEffect, useState} from "react";
import {useInterval} from "./useInterval";

export const useVideoTime = (videoElementRef: HTMLVideoElement | null | undefined) => {
    const [videoInterval, setVideoInterval] = useState<number | null>();
    const [videoTime, setVideoTime] = useState<undefined | number>(undefined);

    useEffect(() => {
        setVideoInterval(window.setInterval(() => {
            videoElementRef && setVideoTime(videoElementRef.currentTime)
        }, 10));
        return () => {
            videoInterval && window.clearInterval(videoInterval);
        }
    }, []);

    useInterval(() => {
        if (videoElementRef) {
            setVideoTime(videoElementRef.currentTime * 1000)
        }
    }, 100);

    return videoTime;
}