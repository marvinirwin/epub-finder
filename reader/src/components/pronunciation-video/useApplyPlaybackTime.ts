import {useSubscription} from "observable-hooks";
import {useContext} from "react";
import {ManagerContext} from "../../App";

export const useApplyPlaybackTime = (videoElementRef: HTMLVideoElement | null | undefined) => {
    const m =useContext(ManagerContext);
    useSubscription(
        m.pronunciationVideoService.distinctSetVideoPlaybackTime$,
        currentTime => {
            if (videoElementRef) {
                videoElementRef.currentTime = currentTime / 1000;
                videoElementRef.play();
            }
        });
}