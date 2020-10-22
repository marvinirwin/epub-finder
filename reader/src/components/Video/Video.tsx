import {Manager} from "../../lib/Manager";
import React, {useEffect, useRef, useState} from "react";
import {useObservableState, useSubscription} from "observable-hooks";
import {Card} from "@material-ui/core";
import {clearInterval} from "timers";
import {CharacterTimingDisplay} from "./VideoCharacterDisplay";
import {filterTextInputEvents} from "../../lib/Manager/BrowserInputs";

function useInterval(callback: () => void, delay: number) {
    const savedCallback = useRef<() => void>();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current && savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

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

export const Video: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const currentSentence = useObservableState(m.inputManager.hoveredSentence$);
    const currentSentenceCharacterIndex = useObservableState(m.inputManager.hoveredCharacterIndex$);
    const [videoElementRef, setVideoElementRef] = useState<HTMLVideoElement | null>();
    const [videoMetaData, setVideoMetaData] = useState<VideoMetaData | undefined>();
    const [chunkedCharacterTimings, setChunkedCharacterTimings] = useState<VideoCharacter[][] | null>();
    const [videoInterval, setVideoInterval] = useState<NodeJS.Timeout | null>();
    const [videoTime, setVideoTime] = useState<undefined | number>(undefined);
    const [highlightBarP1, setHighlightBarP1] = useState<number>();
    const [highlightBarP2, setHighlightBarP2] = useState<number>();

    useEffect(() => {
        setVideoInterval(setInterval(() => {
            videoElementRef && setVideoTime(videoElementRef.currentTime)
        }, 10));
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
            videoElementRef.playbackRate = 0.25;
            videoElementRef.volume = 0.5;

        }
    }, [videoElementRef]);

    useInterval(() => {
        if (videoElementRef) {
            setVideoTime(videoElementRef.currentTime * 1000)
        }
    }, 100);

    useInterval(() => {
        if (videoElementRef && highlightBarP1 && highlightBarP2) {
            // If the video is out of bounds, make it go back into bounds
            if (videoElementRef.currentTime * 1000 > highlightBarP2) {
                videoElementRef.currentTime = highlightBarP1 / 1000
            }
        }
    }, 10)

    const [p1, p2] = ((highlightBarP1 || 0) > (highlightBarP2 || 0)) ?
        [highlightBarP2, highlightBarP1] :
        [highlightBarP1, highlightBarP2];

    function getBoundedPoints(p1: number, p2: number, min: number, max: number) {
        let newp1 = undefined;
        let newp2 = undefined;
        if (p1 > min) {
            if (p1 < max) {
                newp1 = p1;
            } else {
                return []
            }
        } else {
            newp1 = min;
        }
        if (p2 < max) {
            if (p2 > min) {
                newp2 = p2;
            } else {
                return []
            }
        } else {
            newp2 = max;
        }
        return [
            newp1,
            newp2
        ];
    }

    useSubscription(m.inputManager.getKeyDownSubject('v').pipe(filterTextInputEvents), e => {
        e.preventDefault()
        setHighlightBarP1(undefined);
        setHighlightBarP2(undefined);
    });

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
                const chunkStartTime = chunkIndex * CHARACTER_DISPLAY_CHUNK_DURATION;
                const chunkEndTime = chunkStartTime + CHARACTER_DISPLAY_CHUNK_DURATION;
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
                const hasPoints = p1 !== undefined && p2 !== undefined;
                const points = hasPoints
                    ? getBoundedPoints(p1 as number, p2 as number, chunkStartTime, chunkEndTime - 1).map(p => p && (p % CHARACTER_DISPLAY_CHUNK_DURATION) / CHARACTER_DISPLAY_CHUNK_DURATION) :
                    [];

                return <CharacterTimingDisplay
                    key={chunkIndex}
                    characterTimings={chunkedCharacterTiming}
                    v={videoMetaData}
                    duration={CHARACTER_DISPLAY_CHUNK_DURATION}
                    progressBarPosition={progressBarPosition}
                    onClick={percent => {
                        if (videoElementRef) {
                            let currentTime = chunkIndex *
                                CHARACTER_DISPLAY_CHUNK_DURATION_SECONDS +
                                (CHARACTER_DISPLAY_CHUNK_DURATION_SECONDS * percent);
                            videoElementRef.currentTime = currentTime;
                            if (videoElementRef.paused) {
                                videoElementRef.play();
                            }
                        }
                    }}
                    onMouseOver={percentage => {
                        setHighlightBarP2(chunkStartTime + (percentage * CHARACTER_DISPLAY_CHUNK_DURATION))
                    }}
                    onMouseDown={percentage => {
                        setHighlightBarP1(chunkStartTime + (percentage * CHARACTER_DISPLAY_CHUNK_DURATION))
                    }}
                    onMouseUp={percentage => {
                        // setHighlightBarP1(undefined)
                    }}
                    highlightStartPosition={points[0]}
                    highlightEndPosition={points[1]}
                />;
            })
        }
    </Card> : <span/>
}
