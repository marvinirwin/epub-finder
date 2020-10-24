import {Manager} from "../../lib/Manager";
import React, {useEffect, useRef, useState} from "react";
import {useObservableState, useSubscription} from "observable-hooks";
import {Card, IconButton} from "@material-ui/core";
import {clearInterval} from "timers";
import {CharacterTimingDisplay} from "./VideoCharacterDisplay";
import {filterTextInputEvents} from "../../lib/Manager/BrowserInputs";
import CancelPresentationButton from '@material-ui/icons/CancelPresentation';

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

export const MILLISECONDS_PER_CHARACTER_LINE = 5000;
export const SECONDS_PER_CHARACTER_INE = MILLISECONDS_PER_CHARACTER_LINE / 1000;

export const Video: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const currentSentence = useObservableState(m.inputManager.hoveredSentence$);
    const currentSentenceCharacterIndex = useObservableState(m.inputManager.hoveredCharacterIndex$);
    const [videoElementRef, setVideoElementRef] = useState<HTMLVideoElement | null>();
    const [videoMetaData, setVideoMetaData] = useState<VideoMetaData | undefined>();
    const [chunkedCharacterTimings, setChunkedCharacterTimings] = useState<VideoCharacter[][] | null>();
    const [videoInterval, setVideoInterval] = useState<NodeJS.Timeout | null>();
    const [videoTime, setVideoTime] = useState<undefined | number>(undefined);
    const [highlightBarPosition1Ms, setHighlightBarP1] = useState<number>();
    const [highlightBarPosition2Ms, setHighlightBarP2] = useState<number>();
    const [replayDragInProgress, setReplayDragInProgress] = useState<boolean>(false);

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
                const chunkIndex = Math.floor(time / MILLISECONDS_PER_CHARACTER_LINE);
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
        if (videoElementRef && highlightBarPosition1Ms && highlightBarPosition2Ms) {
            // If the video is out of bounds, make it go back into bounds
            if (videoElementRef.currentTime * 1000 > highlightBarPosition2Ms) {
                videoElementRef.currentTime = highlightBarPosition1Ms / 1000
            }
        }
    }, 10)

    const [highlightStartMs, highlightStopMs] = ((highlightBarPosition1Ms || 0) > (highlightBarPosition2Ms || 0)) ?
        [highlightBarPosition2Ms, highlightBarPosition1Ms] :
        [highlightBarPosition1Ms, highlightBarPosition2Ms];

    function getBoundedPoints(p1: number, p2: number, min: number, max: number) {
        const empty: never[] = [];
        let newp1 = undefined;
        let newp2 = undefined;
        if (p1 > min) {
            if (p1 < max) {
                newp1 = p1;
            } else {
                return empty;
            }
        } else {
            newp1 = min;
        }
        if (p2 < max) {
            if (p2 > min) {
                newp2 = p2;
            } else {
                return empty;
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
            && chunkedCharacterTimings.map((chunkedCharacterTiming, lineIndex) => {
                const lineStartTime = lineIndex * MILLISECONDS_PER_CHARACTER_LINE;
                const lineEndTime = lineStartTime + MILLISECONDS_PER_CHARACTER_LINE;
                let progressBarPosition = undefined;
                if (videoTime) {
                    const currentChunkIndex = Math.floor(videoTime / MILLISECONDS_PER_CHARACTER_LINE);
                    if (currentChunkIndex === lineIndex) {
                        // If this is the one with the current playing index
                        // The percentage gets send to the component
                        // Let it figure out its own width
                        progressBarPosition = ((videoTime % MILLISECONDS_PER_CHARACTER_LINE) / MILLISECONDS_PER_CHARACTER_LINE) * 100;
                    }
                }
                const hasPoints = highlightStartMs !== undefined && highlightStopMs !== undefined;
                const highlightBarPoints = hasPoints
                    ? getBoundedPoints(
                        highlightStartMs as number,
                        highlightStopMs as number,
                        lineStartTime,
                        lineEndTime - 1
                    ).map(p => p && (p - (MILLISECONDS_PER_CHARACTER_LINE * lineIndex)) / MILLISECONDS_PER_CHARACTER_LINE) :
                    [];

                return <CharacterTimingDisplay
                    key={lineIndex}
                    characterTimings={chunkedCharacterTiming}
                    v={videoMetaData}
                    duration={MILLISECONDS_PER_CHARACTER_LINE}
                    progressBarPosition={progressBarPosition}
                    onClick={percent => {
                        if (videoElementRef) {
                            videoElementRef.currentTime = lineIndex *
                                SECONDS_PER_CHARACTER_INE +
                                (SECONDS_PER_CHARACTER_INE * percent);
                            if (videoElementRef.paused) {
                                videoElementRef.play();
                            }
                        }
                    }}
                    onMouseOver={percentage => {
                        if (replayDragInProgress) {
                            setHighlightBarP2(lineStartTime + (percentage * MILLISECONDS_PER_CHARACTER_LINE))
                        }
                    }}
                    onMouseDown={percentage => {
                        setReplayDragInProgress(true)
                        setHighlightBarP1(lineStartTime + (percentage * MILLISECONDS_PER_CHARACTER_LINE))
                    }}
                    onMouseUp={percentage => {
                        setReplayDragInProgress(false)
                        // setHighlightBarP1(undefined)
                    }}
                    highlightStartPosition={highlightBarPoints[0]}
                    highlightEndPosition={highlightBarPoints[1]}
                />;
            })
        }
    </Card> : <span/>
}
