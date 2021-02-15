import {useContext, useEffect} from "react";
import {VideoCharacter} from "./video-character.interface";
import {VideoMetadata} from "../../types/";
import {useSubscription} from "observable-hooks";
import {ManagerContext} from "../../App";

export function useApplyTimeBySelectedCharacter(
    videoElementRef: HTMLVideoElement | null | undefined,
    currentSentence: string | undefined,
    videoMetaData: VideoMetadata | undefined ) {
    const m = useContext(ManagerContext);
    useSubscription(
        m.browserInputs.videoCharacterIndex$,
        index => {
            if (videoElementRef
                && currentSentence
                && (index === 0 || index )
                && videoMetaData) {
                const time = videoMetaData?.characters?.[index]?.timestamp;
                const timeScale = videoMetaData?.timeScale;
                if (time && timeScale) {
                    videoElementRef.currentTime = (time * timeScale) / 1000;
                }
            }
        }
    )
}