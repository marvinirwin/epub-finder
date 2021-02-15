import {useObservableState, useSubscription} from "observable-hooks";
import {useContext, useEffect} from "react";
import {ManagerContext} from "../../App";

const setPlaybackSpeed = (videoElementRef: HTMLVideoElement | null | undefined, speed: number | undefined) => {
    if (videoElementRef && speed !== undefined) {
        videoElementRef.playbackRate = speed;
    }
}

export const useApplyPlaybackSpeed = (videoElementRef: HTMLVideoElement | null | undefined) => {
    const m = useContext(ManagerContext);
    const speed = useObservableState(m.settingsService.playbackSpeed$.obs$);
    useSubscription(m.pronunciationVideoService.canPlay$, () => {
        setPlaybackSpeed(videoElementRef, speed);
    })
    useEffect(() => {
        setPlaybackSpeed(videoElementRef, speed);
    }, [videoElementRef, speed])
}