import {useInterval} from "./useInterval";
import {PronunciationVideoService} from "./pronunciation-video.service";

export const useObserveVideoState = (
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

}