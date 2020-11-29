import {useInterval} from "./useInterval";

export const useApplyBoundedTime = (
    videoElementRef: HTMLVideoElement | undefined | null,
    highlightBarPosition1Ms: number | undefined,
    highlightBarPosition2Ms: number | undefined
) => {
    useInterval(() => {
        if (videoElementRef && highlightBarPosition1Ms && highlightBarPosition2Ms) {
            // If the video is out of bounds, make it go back into bounds
            if (videoElementRef.currentTime * 1000 > highlightBarPosition2Ms) {
                videoElementRef.currentTime = highlightBarPosition1Ms / 1000
            }
        }
    }, 10)
}