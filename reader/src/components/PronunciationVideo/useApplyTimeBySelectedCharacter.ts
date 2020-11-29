import {useEffect} from "react";
import {VideoCharacter} from "./video-character.interface";
import {VideoMetadata} from "../../types/";

export function useApplyTimeBySelectedCharacter(
    videoElementRef: HTMLVideoElement | null | undefined,
    currentSentence: string | undefined,
    currentSentenceCharacterIndex: number | undefined,
    videoMetaData: VideoMetadata | undefined |
        { sentence: string | undefined; timeScale: number | undefined; characters: VideoCharacter[] | undefined; filename?: string | undefined | undefined }) {
    useEffect(() => {
        if (videoElementRef
            && currentSentence
            && (currentSentenceCharacterIndex === 0 || currentSentenceCharacterIndex)
            && videoMetaData) {
            const time = videoMetaData?.characters?.[currentSentenceCharacterIndex]?.timestamp;
            const timeScale = videoMetaData?.timeScale;
            if (time && timeScale) {
                videoElementRef.currentTime = (time * timeScale) / 1000;
            }
        }
    }, [
        currentSentenceCharacterIndex,
        currentSentence,
        videoElementRef,
        videoMetaData
    ]);
}