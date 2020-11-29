import {useContext, useEffect, useState} from "react";
import {VideoCharacter} from "./video-character.interface";
import {VideoMetadata} from "./video-meta-data.interface";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";

const CHARACTER_TIMING_SECTION_PADDING = 24;

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
export const useChunkedAudioBuffer = (chunkSizeSeconds: number): Promise<AudioBuffer[]> => {
    const m = useContext(ManagerContext);
    const tape = useObservableState(m.pronunciationVideoService.tape$);
    const [chunked, setChunked] = useState<AudioBuffer[] | undefined>()
    useEffect(() => {
    }, [tape])
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
    return {chunkedCharacterTimings};
};
