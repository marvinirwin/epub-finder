import {useContext, useEffect, useState} from "react";
import {VideoCharacter} from "./video-character.interface";
import {VideoMetadata} from "./video-meta-data.interface";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";


export const useChunkedCharacterTimings = (videoMetaData: VideoMetadata | undefined, sectionWidthInMilliseconds: number | undefined) => {
    const [chunkedCharacterTimings, setChunkedCharacterTimings] = useState<VideoCharacter[][] | null>();
    useEffect(() => {
        if (videoMetaData && sectionWidthInMilliseconds) {
            setChunkedCharacterTimings(videoMetaData.characters.reduce((chunks: VideoCharacter[][], character) => {
                const time = videoMetaData.timeScale * character.timestamp;
                // pixels is too spread out, let's try * 100
                const chunkIndex = Math.floor(time / sectionWidthInMilliseconds);
                if (!chunks[chunkIndex]) {
                    chunks[chunkIndex] = [];
                }
                chunks[chunkIndex].push(character)
                return chunks;
            }, []))
        }
    }, [videoMetaData, sectionWidthInMilliseconds])
    return chunkedCharacterTimings;
};
