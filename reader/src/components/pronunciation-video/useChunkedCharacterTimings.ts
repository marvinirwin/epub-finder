import { useContext, useEffect, useState } from 'react'
import { VideoMetadata, VideoCharacter } from 'languagetrainer-server/src/shared'

export const useChunkedCharacterTimings = (
    videoMetaData: VideoMetadata | undefined,
    sectionWidthInMilliseconds: number | undefined,
) => {
    const [chunkedCharacterTimings, setChunkedCharacterTimings] = useState<
        VideoCharacter[][] | null
    >()
    useEffect(() => {
        if (videoMetaData && sectionWidthInMilliseconds) {
            setChunkedCharacterTimings(
                videoMetaData.characters.reduce(
                    (chunks: VideoCharacter[][], character) => {
                        const time =
                            videoMetaData.timeScale * character.timestamp
                        // pixels is too spread out, let's try * 100
                        const chunkIndex = Math.floor(
                            time / sectionWidthInMilliseconds,
                        )
                        if (!chunks[chunkIndex]) {
                            chunks[chunkIndex] = []
                        }
                        chunks[chunkIndex].push(character)
                        return chunks
                    },
                    [],
                ),
            )
        }
    }, [videoMetaData, sectionWidthInMilliseconds])
    return chunkedCharacterTimings
}
