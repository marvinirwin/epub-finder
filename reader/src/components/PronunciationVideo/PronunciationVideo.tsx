import {Manager} from "../../lib/Manager";
import React, {useEffect, useRef, useState} from "react";
import {useObservableState, useSubscription} from "observable-hooks";
import {Card} from "@material-ui/core";
import {clearInterval} from "timers";
import {CharacterTimingSection} from "./CharacterTimingSection";
import {VideoMetaData} from "./video-meta-data.interface";
import {VideoCharacter} from "./video-character.interface";
import {useChunkedCharacterTimings} from "./useChunkedCharacterTimings";

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
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
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

export const PronunciationVideo: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const currentSentence = useObservableState(m.inputManager.hoveredSentence$);
    const currentSentenceCharacterIndex = useObservableState(m.inputManager.hoveredCharacterIndex$);
    const [videoElementRef, setVideoElementRef] = useState<HTMLVideoElement | null>();
    const [videoMetaData, setVideoMetaData] = useState<VideoMetaData | undefined>();
    const [videoInterval, setVideoInterval] = useState<NodeJS.Timeout | null>();
    const [videoTime, setVideoTime] = useState<undefined | number>(undefined);
    const [highlightBarPosition1Ms, setHighlightBarP1] = useState<number>();
    const [highlightBarPosition2Ms, setHighlightBarP2] = useState<number>();
    const [replayDragInProgress, setReplayDragInProgress] = useState<boolean>(false);
    const [pronunciationSectionsContainer, setPronunciationSectionsContainer] = useState<HTMLDivElement | null>();

    useEffect(() => {
        setVideoInterval(setInterval(() => {
            videoElementRef && setVideoTime(videoElementRef.currentTime)
        }, 10));
        return () => {
            videoInterval && clearInterval(videoInterval);
        }
    }, []);

    const chunkedCharacterTimings = useChunkedCharacterTimings(videoMetaData, pronunciationSectionsContainer?.clientWidth);

    useEffect(() => {
        (async () => {
            if (currentSentence) {
                setVideoMetaData(undefined);
                try {
                    const response = await fetch(`${process.env.PUBLIC_URL}/video/${await sentenceToFilename(currentSentence)}.json`)
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
            const time = videoMetaData?.characters[currentSentenceCharacterIndex]?.timestamp;
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
        let newp1;
        let newp2;
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

    useSubscription(m.hotkeyEvents.hideVideo$, () => setVideoMetaData(undefined));

    return <div className={'pronunciation-video-container'}>
        {videoMetaData ? <Card className={'pronunciation-video-container-card'}>
            {/*
        <div style={{position: 'absolute', top: 0, zIndex: 10}}>
            <HotkeyWrapper action={"HIDE_VIDEO"}>
                <IconButton
                    onClick={() => m.hotkeyEvents.hideVideo$.next()}
                >
                    <CancelPresentationIcon/>
                </IconButton>
            </HotkeyWrapper>
        </div>
*/}
            <div className={'pronunciation-sections-container'} ref={setPronunciationSectionsContainer}>
                {
                    (chunkedCharacterTimings && videoMetaData)
                    && chunkedCharacterTimings.map((chunkedCharacterTiming, lineIndex) => {
                        const lineStartTime = lineIndex * MILLISECONDS_PER_CHARACTER_LINE;
                        const lineEndTime = lineStartTime + MILLISECONDS_PER_CHARACTER_LINE;
                        let progressBarPosition;
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

                        return <CharacterTimingSection
                            key={lineIndex}
                            characterTimings={chunkedCharacterTiming}
                            videoMetaData={videoMetaData}
                            sectionDuration={MILLISECONDS_PER_CHARACTER_LINE}
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
            </div>
            <video
                ref={setVideoElementRef}
                src={(currentSentence && videoMetaData) ? `${process.env.PUBLIC_URL}/video/${videoMetaData.filename}` : ''}
                autoPlay
                controls
            />
        </Card> : <span/>
        }
    </div>
}
