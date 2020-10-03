import {Manager} from "../lib/Manager";
import React, {useEffect, useState} from "react";
import {useObservableState} from "observable-hooks";
import {Card} from "@material-ui/core";


export interface VideoMetaData {
    sentence: string;
    timeScale: number;
    characters: VideoCharacter[];
    filename?: string;
}

export interface VideoCharacter {
    char: string;
    timestamp: number;
}

export function sentenceToFilename(sentence: string) {
    return sentence.trim();
}

export const Video: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const currentSentence = useObservableState(m.inputManager.hoveredSentence$);
    const currentSentenceCharacterIndex = useObservableState(m.inputManager.hoveredCharacterIndex$);
    const [videoElementRef, setVideoElementRef] = useState<HTMLVideoElement | null>();
    const [videoMetaData, setVideoMetaData] = useState<VideoMetaData | undefined>();
    useEffect(() => {
        (async () => {
            if (currentSentence) {
                setVideoMetaData(undefined);
                let input = `/video/${sentenceToFilename(currentSentence)}.json`;
                const response = await fetch(input)
                if (response.status === 200) {
                    setVideoMetaData(await response.json())
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
            let time = videoMetaData?.characters[currentSentenceCharacterIndex].timestamp;
            let timeScale = videoMetaData?.timeScale;
            if (time && timeScale) {
                videoElementRef.currentTime = (time * timeScale) / 1000;
                videoElementRef.play();
            }
        }
    }, [currentSentenceCharacterIndex, currentSentence, videoElementRef, videoMetaData]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const canvases = [...Array(5)].map((_, i) => useState<null | HTMLCanvasElement>());

    useEffect(() => {
        if (videoElementRef) {
            videoElementRef.defaultPlaybackRate = 0.25;
            videoElementRef.volume = 0;

        }
    }, [videoElementRef])
    return <Card className={'video'} elevation={3}>
        <video
            ref={setVideoElementRef}
            src={(currentSentence && videoMetaData) ? `/video/${videoMetaData.filename}` : ''}
            autoPlay
        />
        {
            // [canvas, setCanvas] = useState();
            canvases.map(([canvas, setCanvas]) => <canvas ref={setCanvas}> </canvas>)
        }
    </Card>
}
