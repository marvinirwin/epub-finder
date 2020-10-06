import {Manager} from "../lib/Manager";
import React, {useEffect, useState} from "react";
import {useObservableState} from "observable-hooks";
import {Card} from "@material-ui/core";
import {timestamp} from "rxjs/operators";
import {Characters} from "./Quiz/Characters";


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

export function sentenceToFilename(sentence: string) {
    return sentence.trim();
}

export const CHARACTER_DISPLAY_CHUNK_DURATION = 5000;

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
                    ctx.strokeText(characterTiming.character, x, canvas.height / 2);
                })
            }
        }
    }, [canvas, characterTimings]);
    const [hoverBarPosition, setHoverBarPosition] = useState<number | null>();
    return <div style={{position: 'relative'}} onMouseLeave={() => setHoverBarPosition(null)} onMouseMove={ev => {
        /**
         * To get where the hoverBar is supposed to be take the clientX and subtract the clientX of the canvas
         */
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            setHoverBarPosition(ev.clientX - rect.x)
        }
    }} >
        {progressBarPosition !== undefined && <div style={{
            position: 'absolute',
            backgroundColor: 'black',
            width: '1px',
            height: '100%',
            left: progressBarPosition
        }}/>}
        {hoverBarPosition !== null && <div style={{
            position: 'absolute',
            backgroundColor: 'blue',
            width: '1px',
            height: '100%',
            left: hoverBarPosition
        }}/>}
        <canvas width={"500px"} height={"50px"} className={'recording-ctx'} ref={setCanvas}/>
    </div>
}

export const Video: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const currentSentence = useObservableState(m.inputManager.hoveredSentence$);
    const currentSentenceCharacterIndex = useObservableState(m.inputManager.hoveredCharacterIndex$);
    const [videoElementRef, setVideoElementRef] = useState<HTMLVideoElement | null>();
    const [videoMetaData, setVideoMetaData] = useState<VideoMetaData | undefined>();
    const [chunkedCharacterTimings, setChunkedCharacterTimings] = useState<VideoCharacter[][] | null>();
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
                let input = `/video/${sentenceToFilename(currentSentence)}.json`;
                try {
                    const response = await fetch(input)
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
            videoElementRef.volume = 0;

        }
    }, [videoElementRef])
    return videoMetaData ? <Card className={'video'} elevation={3}>
        <video
            ref={setVideoElementRef}
            src={(currentSentence && videoMetaData) ? `/video/${videoMetaData.filename}` : ''}
            autoPlay
        />
        {
            (chunkedCharacterTimings && videoMetaData)
            && chunkedCharacterTimings.map((chunkedCharacterTiming, i) => <CharacterTimingDisplay
                key={i}
                characterTimings={chunkedCharacterTiming}
                v={videoMetaData}
                duration={CHARACTER_DISPLAY_CHUNK_DURATION}
                progressBarPosition={undefined}
                onTimeSelected={percent => {
                    if (videoElementRef) {
                        videoElementRef.currentTime = i * CHARACTER_DISPLAY_CHUNK_DURATION + (CHARACTER_DISPLAY_CHUNK_DURATION * percent);
                    }
                }}
            />)
        }
    </Card> : <span></span>
}
