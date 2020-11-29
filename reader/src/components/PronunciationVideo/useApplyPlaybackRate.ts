import {useSubscription} from "observable-hooks";
import {useContext} from "react";
import {ManagerContext} from "../../App";

export const useApplyPlaybackSpeed = (videoElementRef: HTMLVideoElement | null | undefined) => {
    const m = useContext(ManagerContext);
    useSubscription(m.settingsService.playbackSpeed$, speed => {
        if (videoElementRef) {
            videoElementRef.playbackRate = speed;
        }
    });
}