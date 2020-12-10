import {useInterval} from "./useInterval";
import {useDebouncedFn} from "beautiful-react-hooks";
import {orderedPoints} from "./math.module";

export const useApplyBoundedTime = (
    videoElementRef: HTMLVideoElement | undefined | null,
    highlightBarPosition1Ms: number | undefined,
    highlightBarPosition2Ms: number | undefined
) => {
    const setVideoTime = useDebouncedFn(() => {
        if (videoElementRef && highlightBarPosition1Ms && highlightBarPosition2Ms) {
            videoElementRef.currentTime = orderedPoints(highlightBarPosition1Ms, highlightBarPosition2Ms)[0] / 1000;
            // If the video is out of bounds, make it go back into bounds
            videoElementRef.play();
        }
    }, 20);
    useInterval(() => {
        if (videoElementRef &&
            highlightBarPosition1Ms &&
            highlightBarPosition2Ms) {
            const isOverLimit = videoElementRef.currentTime * 1000 > highlightBarPosition2Ms;
            const isBeforeBeginning = videoElementRef.currentTime * 1000 < (highlightBarPosition1Ms - 100);
            if ((isOverLimit || isBeforeBeginning)) {
                setVideoTime()
            }
        }
    }, 10)
}