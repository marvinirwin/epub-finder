import React, {useState} from "react";
import {usePlaceHighlightBar} from "./usePlaceHighlightBar";
import {TemporalPositionBar} from "./TemporalPositionBar";
import {HighlightBar} from "./HighlightBar";
import {percentagePosition} from "./math.module";
import {VideoMetaData} from "./video-meta-data.interface";
import {VideoCharacter} from "./video-character.interface";
import {isChineseCharacter} from "../../lib/Interfaces/OldAnkiClasses/Card";

export type Percentage = number;

export const CharacterTimingSection: React.FunctionComponent<{
    characterTimings: VideoCharacter[],
    videoMetaData: VideoMetaData,
    sectionDurationMs: number,
    sectionWidthPx: number,
    progressBarPercentPosition: number | undefined,
    highlightStartPosition: number,
    highlightEndPosition: number,
    onClick: (p: Percentage) => void,
    onMouseDown: (n: Percentage) => void,
    onMouseOver: (n: Percentage) => void,
    onMouseUp: (n: Percentage) => void,
}> = ({
          characterTimings,
          videoMetaData,
          sectionDurationMs,
          progressBarPercentPosition,
          onClick,
          highlightStartPosition,
          highlightEndPosition,
          onMouseDown,
          onMouseOver,
          onMouseUp,
            sectionWidthPx
      }) => {
    const [sectionContainer, setSectionContainer] = useState<HTMLDivElement | null>();
    const [hoverBarPercentPosition, setHoverBarPercentPosition] = useState<number | undefined>(undefined);
    const [highlightBar, setHighlightBar] = useState<HTMLDivElement | null>();

    usePlaceHighlightBar(highlightBar, sectionContainer, highlightStartPosition, highlightEndPosition);

    return <div className={'character-timing-section-container'}
                style={{position: 'relative'}}
                onMouseLeave={() => {
                    setHoverBarPercentPosition(undefined);
                }}
                onMouseMove={ev => {
                    /**
                     * To get where the hoverBar is supposed to be take the clientX and subtract the clientX of the canvas
                     */
                    if (sectionContainer) {
                        const rect = sectionContainer.getBoundingClientRect();
                        const percentage = (ev.clientX - rect.x) / sectionContainer.clientWidth * 100;
                        setHoverBarPercentPosition(percentage);
                        onMouseOver(percentage);
                    }
                }}
                onClick={ev => {
                    if (sectionContainer) {
                        const rect = sectionContainer.getBoundingClientRect();
                        onClick(((ev.clientX - rect.x) / sectionContainer.clientWidth))
                    }
                }}
                onMouseDown={ev => {
                    if (sectionContainer) {
                        const rect = sectionContainer.getBoundingClientRect();
                        onMouseDown((ev.clientX - rect.x) / sectionContainer.clientWidth)
                    }
                }}
                onMouseUp={ev => {
                    if (sectionContainer) {
                        const rect = sectionContainer.getBoundingClientRect();
                        onMouseUp((ev.clientX - rect.x) / sectionContainer.clientWidth)
                    }
                }}
    >
        <HighlightBar setHighlightBar={setHighlightBar}/>
        <TemporalPositionBar position={hoverBarPercentPosition ?  hoverBarPercentPosition / 100 * sectionWidthPx : undefined} color={'blue'}/>
        <TemporalPositionBar position={progressBarPercentPosition ? progressBarPercentPosition / 100 * sectionWidthPx : undefined} color={'black'}/>
        <div ref={setSectionContainer} className={'character-timing-section'}>
            {characterTimings.filter(characterTiming => isChineseCharacter(characterTiming.character)).map(characterTiming => <mark style={
                {left: `${percentagePosition(sectionDurationMs, characterTiming.timestamp * videoMetaData.timeScale) * .9}%`}
            }>{characterTiming.character}
            </mark>)}
        </div>
    </div>
}