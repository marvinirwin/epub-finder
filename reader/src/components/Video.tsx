import {Manager} from "../lib/Manager";
import React, {useEffect, useState} from "react";
import {useObservableState} from "observable-hooks";
import {Card} from "@material-ui/core";
import {clearInterval} from "timers";

const CANVAS_WIDTH = 500;

export interface VideoMetaData {
    sentence: string;
    timeScale: number;
    characters: VideoCharacter[];
    filename?: string;
}

export interface VideoCharacter {
    character: string;
    timestamp: number;
}

export async function sentenceToFilename(sentence: string): Promise<string> {
    return digestMessage(sentence.normalize().replace(/\s+/, ' '));
}

async function digestMessage(message: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(message.normalize("NFC"));
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
     // convert bytes to hex string
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const CHARACTER_DISPLAY_CHUNK_DURATION = 5000;
export const CHARACTER_DISPLAY_CHUNK_DURATION_SECONDS = CHARACTER_DISPLAY_CHUNK_DURATION / 1000;

export const CharacterTimingDisplay: React.FunctionComponent<{
    characterTimings: VideoCharacter[],
    v: VideoMetaData,
    duration: number,
    progressBarPosition: number | undefined,
    onTimeSelected: (percent: number) => void
}> = ({
          characterTimings,
          v,
          duration,
          progressBarPosition,
          onTimeSelected
      }) => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>()
    useEffect(() => {
        // Clear the canvas and draw the characters
        if (canvas && characterTimings) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.font = '24px serif';
                characterTimings.forEach(characterTiming => {
                    const x = ((characterTiming.timestamp * v.timeScale) % duration) / duration * canvas.width;
                    ctx.fillText(characterTiming.character, x, canvas.height / 2);
                })
            }
        }
    }, [canvas, characterTimings]);
    const [hoverBarPosition, setHoverBarPosition] = useState<number | undefined>(undefined);
    return <div style={{position: 'relative'}}
                onMouseLeave={() => setHoverBarPosition(undefined)}
                onMouseMove={ev => {
                    /**
                     * To get where the hoverBar is supposed to be take the clientX and subtract the clientX of the canvas
                     */
                    if (canvas) {
                        const rect = canvas.getBoundingClientRect();
                        setHoverBarPosition(ev.clientX - rect.x)
                    }
                }}
                onClick={ev => {
                    if (canvas) {
                        const rect = canvas.getBoundingClientRect();
                        onTimeSelected(((ev.clientX - rect.x) / CANVAS_WIDTH * 100))
                    }
                }}
    >
        {progressBarPosition !== undefined && <div style={{
            position: 'absolute',
            backgroundColor: 'black',
            width: '1px',
            height: '100%',
            left: progressBarPosition * CANVAS_WIDTH
        }}/>}
        {hoverBarPosition !== undefined && <div style={{
            position: 'absolute',
            backgroundColor: 'blue',
            width: '1px',
            height: '100%',
            left: hoverBarPosition
        }}/>}
        <canvas
            width={`${CANVAS_WIDTH}px`}
            height={"50px"}
            className={'recording-ctx'}
            ref={setCanvas}
        />
    </div>
}

export const Video: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const currentSentence = useObservableState(m.inputManager.hoveredSentence$);
    const currentSentenceCharacterIndex = useObservableState(m.inputManager.hoveredCharacterIndex$);
    const [videoElementRef, setVideoElementRef] = useState<HTMLVideoElement | null>();
    const [videoMetaData, setVideoMetaData] = useState<VideoMetaData | undefined>();
    const [chunkedCharacterTimings, setChunkedCharacterTimings] = useState<VideoCharacter[][] | null>();
    const [videoTime, setVideoTime] = useState<number | null>();
    const [videoInterval, setVideoInterval] = useState<NodeJS.Timeout | null>();
    useEffect(() => {
        setVideoInterval(setInterval(() => {
            videoElementRef && setVideoTime(videoElementRef.currentTime)
        }, 100));
        return () => {
            videoInterval && clearInterval(videoInterval);
        }
    }, []);
    useEffect(() => {
        if (videoMetaData) {
            setChunkedCharacterTimings(videoMetaData.characters.reduce((chunks: VideoCharacter[][], character) => {
                const time = videoMetaData.timeScale * character.timestamp;
                const chunkIndex = Math.floor(time / CHARACTER_DISPLAY_CHUNK_DURATION);
                if (!chunks[chunkIndex]) {
                    chunks[chunkIndex] = [];
                }
                chunks[chunkIndex].push(character)
                return chunks;
            }, []))
        }
    }, [videoMetaData])

    useEffect(() => {
        (async () => {
            if (currentSentence) {
                setVideoMetaData(undefined);
                try {
                    const response = await fetch(`/video/${await sentenceToFilename(currentSentence)}.json`)
                    if (response.status === 200) {
                        setVideoMetaData(await response.json())
                    }
                } catch (e) {
                }
            }
        })()
    }, [currentSentence]);
    // TODO every time currentSentence changes I'll need to try and fetch the json meta data for the video
    useEffect(() => {
        if (videoElementRef
            && currentSentence
            && (currentSentenceCharacterIndex === 0 || currentSentenceCharacterIndex)
            && videoMetaData) {
            let time = videoMetaData?.characters[currentSentenceCharacterIndex]?.timestamp;
            let timeScale = videoMetaData?.timeScale;
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

    useEffect(() => {
        if (videoElementRef) {
            videoElementRef.defaultPlaybackRate = 0.25;
            videoElementRef.volume = 0.5;

        }
    }, [videoElementRef]);

    return videoMetaData ? <Card className={'video'} elevation={3}>
        <video
            ref={setVideoElementRef}
            src={(currentSentence && videoMetaData) ? `/video/${videoMetaData.filename}` : ''}
            autoPlay
            controls
        />
        {
            (chunkedCharacterTimings && videoMetaData)
            && chunkedCharacterTimings.map((chunkedCharacterTiming, chunkIndex) => {
                let progressBarPosition = undefined;
                if (videoTime) {
                    const currentChunkIndex = Math.floor(videoTime / CHARACTER_DISPLAY_CHUNK_DURATION);
                    if (currentChunkIndex === chunkIndex) {
                        // If this is the one with the current playing index
                        // The percentage gets send to the component
                        // Let it figure out its own width
                        progressBarPosition = ((videoTime % CHARACTER_DISPLAY_CHUNK_DURATION) / CHARACTER_DISPLAY_CHUNK_DURATION) * 100;
                    }

                }
                return <CharacterTimingDisplay
                    key={chunkIndex}
                    characterTimings={chunkedCharacterTiming}
                    v={videoMetaData}
                    duration={CHARACTER_DISPLAY_CHUNK_DURATION}
                    progressBarPosition={progressBarPosition}
                    onTimeSelected={percent => {
                        if (videoElementRef) {
                            let currentTime = chunkIndex *
                                CHARACTER_DISPLAY_CHUNK_DURATION_SECONDS +
                                (CHARACTER_DISPLAY_CHUNK_DURATION_SECONDS * percent / 100);
                            videoElementRef.currentTime = currentTime;
                            if (videoElementRef.paused) {
                                videoElementRef.play();
                            }
                        }
                    }}
                />;
            })
        }
    </Card> : <span/>
}
