import React, {useContext, useState} from "react";
import {usePlaceHighlightBar} from "./usePlaceHighlightBar";
import {TemporalPositionBar} from "./TemporalPositionBar";
import {HighlightBar} from "./HighlightBar";
import {VideoCharacter} from "./video-character.interface";
import {ManagerContext} from "../../App";
import {useObservableState, useSubscription} from "observable-hooks";
import {PronunciationTimingCharacterComponent} from "./pronunciation-character.component";
import {useDebouncedFn} from "beautiful-react-hooks";
import {VideoMetadata} from "../../types/";

export type Percentage = number;

export const CharacterTimingSection: React.FunctionComponent<{
    characterTimings: VideoCharacter[],
    videoMetaData: VideoMetadata,
    sectionDurationMs: number,
    sectionWidthPx: number,
    progressBarPercentPosition: number | undefined,
    highlightStartPosition: number,
    highlightEndPosition: number,
    onClick: (p: Percentage) => void,
    onMouseDown: (n: Percentage) => void,
    onMouseOver: (n: Percentage) => void,
    onMouseUp: (n: Percentage) => void,
    sectionIndex: number
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
          sectionWidthPx,
        sectionIndex
      }) => {
    const [sectionContainer, setSectionContainer] = useState<HTMLDivElement | null>();
    const [hoverBarPercentPosition, setHoverBarPercentPosition] = useState<number | undefined>(undefined);
    const [highlightBar, setHighlightBar] = useState<HTMLDivElement | null>();
    usePlaceHighlightBar(highlightBar, sectionContainer, highlightStartPosition, highlightEndPosition);
    const manager = useContext(ManagerContext);
    const editingIndex = useObservableState(manager.editingVideoMetadataService.editingCharacterIndex$);
    const editing = videoMetaData && editingIndex !== undefined && editingIndex >= 0;
    useSubscription(manager.inputManager.getKeyDownSubject('d'), () => {
            if (editing) {
                manager.editingVideoMetadataService.moveCharacter(
                    videoMetaData,
                    editingIndex as number,
                    videoMetaData.characters[editingIndex as number].timestamp + 5
                );
            }
        }
    )
    useSubscription(manager.inputManager.getKeyDownSubject('a'), () => {
            if (editing) {
                manager.editingVideoMetadataService.moveCharacter(
                    videoMetaData,
                    editingIndex as number,
                    videoMetaData.characters[editingIndex as number].timestamp - 5
                );
            }
        }
    );
    const onDropOver = (dragClientX: number, containerLeft: number, containerWidth: number) => {
        if (editing) {
            const positionFraction =  (dragClientX - containerLeft) / containerWidth;
            const newTimestamp = (positionFraction * sectionDurationMs) + sectionDurationMs * sectionIndex;
            manager.pronunciationVideoService.setVideoPlaybackTime$.next(newTimestamp);
            manager.editingVideoMetadataService.setCharacterTimestamp(
                videoMetaData,
                editingIndex as number,
                newTimestamp
            ).then(metadata => {
                manager.pronunciationVideoService.videoMetadata$.next(metadata);
            });
        }
    };
    const debouncedOnDropOver = useDebouncedFn(onDropOver, 250);


    return <div className={'character-timing-section-container'}
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
                        onClick(((ev.clientX - rect.x) / sectionContainer.clientWidth) * 100)
                    }
                }}
                onMouseDown={ev => {
                    if (sectionContainer) {
                        const rect = sectionContainer.getBoundingClientRect();
                        onMouseDown((ev.clientX - rect.x) / sectionContainer.clientWidth * 100)
                    }
                }}
                onMouseUp={ev => {
                    if (sectionContainer) {
                        const rect = sectionContainer.getBoundingClientRect();
                        onMouseUp((ev.clientX - rect.x) / sectionContainer.clientWidth * 100)
                    }
                }}
                onDragOver={ev => {
                    ev.dataTransfer.dropEffect = "move";
/*
                    if (sectionContainer && ev.clientX) {
                        const bb = sectionContainer.getBoundingClientRect().x;
                    }
*/
                    if (ev.clientX && sectionContainer?.clientWidth && sectionContainer.clientLeft) {
                        debouncedOnDropOver(ev.clientX, sectionContainer.getBoundingClientRect().x, sectionContainer.clientWidth)
                    }
                }}
                onDrop={(ev) => {
                    ev.preventDefault();
/*
                    if (ev.clientX && sectionContainer?.clientWidth && sectionContainer.clientLeft) {
                        debouncedOnDropOver(ev.clientX, sectionContainer.clientLeft, sectionContainer.clientWidth)
                    }
*/
                }}

    >
        <HighlightBar setHighlightBar={setHighlightBar}/>
        <TemporalPositionBar
            position={hoverBarPercentPosition ? hoverBarPercentPosition / 100 * sectionWidthPx : undefined}
            color={'blue'}/>
        <TemporalPositionBar
            position={progressBarPercentPosition ? progressBarPercentPosition / 100 * sectionWidthPx * .9 : undefined}
            color={'black'}/>
        <div ref={setSectionContainer} className={'character-timing-section'}>
            {characterTimings.map((videoCharacter, index) =>
                <PronunciationTimingCharacterComponent key={index}
                                                       editingIndex={editingIndex}
                                                       index={index + sectionIndex}
                                                       sectionDuration={sectionDurationMs}
                                                       videoCharacter={videoCharacter}
                                                       timeScale={videoMetaData.timeScale}
                                                       onClick={ev => {
                                                           ev.preventDefault();
                                                           ev.stopPropagation();
                                                           manager.editingVideoMetadataService.editingCharacterIndex$.next(index + sectionIndex);
                                                       }}/>)}
        </div>
    </div>
}