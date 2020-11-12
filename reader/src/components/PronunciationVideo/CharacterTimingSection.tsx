import React, {useState} from "react";
import {usePlaceHighlightBar} from "./usePlaceHighlightBar";
import {TemporalPositionBar} from "./TemporalPositionBar";
import {HighlightBar} from "./HighlightBar";
import {percentagePosition} from "./percentages.service";
import {VideoMetaData} from "./video-meta-data.interface";
import {VideoCharacter} from "./video-character.interface";

export type Percentage = number;

export const CharacterTimingSection: React.FunctionComponent<{
    characterTimings: VideoCharacter[],
    videoMetaData: VideoMetaData,
    sectionDuration: number,
    progressBarPosition: number | undefined,
    highlightStartPosition: number,
    highlightEndPosition: number,
    onClick: (p: Percentage) => void,
    onMouseDown: (n: Percentage) => void,
    onMouseOver: (n: Percentage) => void,
    onMouseUp: (n: Percentage) => void,
}> = ({
          characterTimings,
          videoMetaData,
          sectionDuration,
          progressBarPosition,
          onClick,
          highlightStartPosition,
          highlightEndPosition,
          onMouseDown,
          onMouseOver,
          onMouseUp
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
                        const percentage = (ev.clientX - rect.x) / sectionContainer.clientWidth;
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
        <TemporalPositionBar position={hoverBarPercentPosition} color={'blue'}/>
        <TemporalPositionBar position={progressBarPosition} color={'black'}/>
        <div ref={setSectionContainer} className={'character-timing-section'}>
            {characterTimings.map(characterTiming => <mark style={
                {left: `${percentagePosition(sectionDuration, characterTiming.timestamp * videoMetaData.timeScale)}%`}
            }>{characterTiming.character}
            </mark>)}
        </div>
    </div>
}