import {useEffect, useState} from "react";
import {VideoCharacter} from "./video-character.interface";
import {VideoMetaData} from "./video-meta-data.interface";

const CHARACTER_TIMING_SECTION_PADDING = 24;

export const useChunkedCharacterTimings = (videoMetaData: VideoMetaData | undefined, sectionWidthInPixels: number | undefined) => {
    const [chunkedCharacterTimings, setChunkedCharacterTimings] = useState<VideoCharacter[][] | null>();
    useEffect(() => {
        if (videoMetaData && sectionWidthInPixels) {
            const sectionWidthInMilliseconds = (sectionWidthInPixels * 5);
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
    }, [videoMetaData, sectionWidthInPixels])
    return chunkedCharacterTimings;
};