import React, {useEffect, useState} from "react";
import {VideoCharacter, VideoMetaData} from "./Video";

const CANVAS_WIDTH = 500;

export type Percentage = number;

export const CharacterTimingDisplay: React.FunctionComponent<{
    characterTimings: VideoCharacter[],
    v: VideoMetaData,
    duration: number,
    progressBarPosition: number | undefined,
    highlightStartPosition: number,
    highlightEndPosition: number,
    onClick: (p: Percentage) => void,
    onMouseDown: (n: Percentage) => void,
    onMouseOver: (n: Percentage) => void,
    onMouseUp: (n: Percentage) => void,
}> = ({
          characterTimings,
          v,
          duration,
          progressBarPosition,
          onClick,
          highlightStartPosition,
          highlightEndPosition,
          onMouseDown,
          onMouseOver,
          onMouseUp
      }) => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>();
    const [hoverBarPosition, setHoverBarPosition] = useState<number | undefined>(undefined);
    const [highlightBar, setHighlightBar] = useState<HTMLDivElement | null>();
    useEffect(() => {
        if (highlightBar) {
            if (highlightStartPosition === undefined || highlightEndPosition === undefined) {
            } else {
                highlightBar.style.left = `${highlightStartPosition * CANVAS_WIDTH}px`;
            }
        }

    }, [highlightStartPosition, highlightEndPosition]);
    useEffect(() => {
        if (highlightBar) {
            if (highlightEndPosition === undefined || highlightStartPosition === undefined) {
                highlightBar.style.width = '0';
            } else {
                highlightBar.style.width = `${(highlightEndPosition - highlightStartPosition) * CANVAS_WIDTH}px`;
            }
        }
    }, [highlightEndPosition])

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
    return <div style={{position: 'relative'}}
                onMouseLeave={() => {
                    setHoverBarPosition(undefined);
                }
                }
                onMouseMove={ev => {
                    /**
                     * To get where the hoverBar is supposed to be take the clientX and subtract the clientX of the canvas
                     */
                    if (canvas) {
                        const rect = canvas.getBoundingClientRect();
                        const percentage = (ev.clientX - rect.x) / CANVAS_WIDTH;
                        setHoverBarPosition(percentage);
                        onMouseOver(percentage);
                    }
                }}
                onClick={ev => {
                    if (canvas) {
                        const rect = canvas.getBoundingClientRect();
                        onClick(((ev.clientX - rect.x) / CANVAS_WIDTH))
                    }
                }}
                onMouseDown={ev => {
                    if (canvas) {
                        const rect = canvas.getBoundingClientRect();
                        onMouseDown((ev.clientX - rect.x) / CANVAS_WIDTH)
                    }
                }}
                onMouseUp={ev => {
                    if (canvas) {
                        const rect = canvas.getBoundingClientRect();
                        onMouseUp((ev.clientX - rect.x) / CANVAS_WIDTH)
                    }
                }}
    >
        {progressBarPosition !== undefined && <div style={{
            position: 'absolute',
            backgroundColor: 'black',
            width: '1px',
            height: '100%',
            left: (progressBarPosition / 100) * CANVAS_WIDTH
        }}/>}
        {hoverBarPosition !== undefined && <div style={{
            position: 'absolute',
            backgroundColor: 'blue',
            width: '1px',
            height: '100%',
            left: hoverBarPosition
        }}/>}
        <div ref={setHighlightBar} style={{
            position: 'absolute',
            backgroundColor: 'blue',
            opacity: '50%',
            height: '100%',
        }}>
        </div>
        <canvas
            width={`${CANVAS_WIDTH}px`}
            height={"50px"}
            className={'recording-ctx'}
            ref={setCanvas}
        />
    </div>
}