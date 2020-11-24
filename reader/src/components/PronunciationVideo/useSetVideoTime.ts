import {useEffect} from "react";

export function useSetVideoTime(videoElementRef: HTMLVideoElement | null | undefined) {
    useEffect(() => {
        if (videoElementRef) {
            videoElementRef.playbackRate = 0.25;
            videoElementRef.volume = 0.5;
        }
    }, [videoElementRef]);
}