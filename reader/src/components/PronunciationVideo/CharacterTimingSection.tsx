import React, {useContext, useEffect, useState} from "react";
import {usePlaceHighlightBar} from "./usePlaceHighlightBar";
import {TemporalPositionBar} from "./TemporalPositionBar";
import {HighlightBar} from "./HighlightBar";
import {VideoCharacter} from "./video-character.interface";
import {ManagerContext} from "../../App";
import {useObservableState, useSubscription} from "observable-hooks";
import {PronunciationTimingCharacterComponent} from "./pronunciation-character.component";
import {useDebouncedFn} from "beautiful-react-hooks";
import {VideoMetadata} from "../../types/";
import {draw} from "./draw-sine-wav";
import {filterData, normalizeData} from "../../lib/Audio/AudioGraphing";

export type Percentage = number;
const urlParams = new URLSearchParams(window.location.search);
const editMode = !!urlParams.get('edit')

export const CharacterTimingSection: React.FunctionComponent<{
    characterTimings: VideoCharacter[],
    videoMetaData: VideoMetadata,
    sectionDurationMs: number,
    sectionWidthPx: number,
    progressBarFraction: number | undefined,
    highlightStartPosition: number,
    highlightEndPosition: number,
    onClick: (p: Percentage) => void,
    onMouseDown: (n: Percentage) => void,
    onMouseOver: (n: Percentage) => void,
/*
    onMouseUp: (n: Percentage) => void,
*/
    sectionIndex: number,
    characterIndexStart: number,
    audioBuffer: AudioBuffer | undefined
}> = ({
          characterTimings,
          videoMetaData,
          sectionDurationMs,
          progressBarFraction,
          onClick,
          highlightStartPosition,
          highlightEndPosition,
          onMouseDown,
          onMouseOver,
/*
          onMouseUp,
*/
          sectionWidthPx,
          sectionIndex,
          characterIndexStart,
          audioBuffer
      }) => {
    const [canvas, setCanvasRef] = useState<HTMLCanvasElement | null>();
    const [sectionContainer, setSectionContainer] = useState<HTMLDivElement | null>();
    const [hoverBarFraction, setHoverBarFraction] = useState<number | undefined>(undefined);
    const [highlightBar, setHighlightBar] = useState<HTMLDivElement | null>();
    usePlaceHighlightBar(highlightBar, sectionContainer, highlightStartPosition, highlightEndPosition);
    const manager = useContext(ManagerContext);
    const editingIndex = useObservableState(manager.editingVideoMetadataService.editingCharacterIndex$);
    const editing = videoMetaData && editingIndex !== undefined && editingIndex >= 0;

    const onDropOver = (dragClientX: number, containerLeft: number, containerWidth: number) => {
        if (editing) {
            const positionFraction = (dragClientX - containerLeft) / containerWidth;
            const newTimestamp = (positionFraction * sectionDurationMs) + sectionDurationMs * sectionIndex;
            manager.pronunciationVideoService.setVideoPlaybackTime$.next(newTimestamp);
            manager.editingVideoMetadataService.setCharacterTimestamp(
                videoMetaData,
                editingIndex as number,
                newTimestamp
            ).then(metadata => {
                manager.pronunciationVideoService.videoMetadata$.next(metadata);
                manager.pronunciationVideoService.setVideoPlaybackTime$.next(newTimestamp - 100);
            });
        }
    };
    const debouncedOnDropOver = useDebouncedFn(onDropOver, 250);

    useEffect(() => {
        if (canvas && audioBuffer) {
            canvas.width = (canvas.parentElement?.clientWidth || 240) - 24; // This is the end of section padding
            canvas.height = 50;
            draw(normalizeData(filterData(audioBuffer, 1000)), canvas)
        }
    }, [audioBuffer, canvas])


    return <div className={'character-timing-section-container'}
                ref={el => manager.introService.sectionsRef$.next(el)}
                onMouseLeave={() => {
                    setHoverBarFraction(undefined);
                }}
                onMouseMove={ev => {
                    /**
                     * To get where the hoverBar is supposed to be take the clientX and subtract the clientX of the canvas
                     */
                    if (sectionContainer) {
                        const rect = sectionContainer.getBoundingClientRect();
                        const fraction = (ev.clientX - rect.x) / sectionContainer.clientWidth;
                        setHoverBarFraction(fraction);
                        onMouseOver(fraction);
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
/*
                onMouseUp={ev => {
                    if (sectionContainer) {
                        const rect = sectionContainer.getBoundingClientRect();
                        onMouseUp((ev.clientX - rect.x) / sectionContainer.clientWidth)
                    }
                }}
*/
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
        <canvas ref={setCanvasRef}/>
        <HighlightBar setHighlightBar={setHighlightBar}/>
        <TemporalPositionBar
            position={hoverBarFraction ? hoverBarFraction * sectionWidthPx : undefined}
            color={'blue'}/>
        <TemporalPositionBar
            position={progressBarFraction ? progressBarFraction * sectionWidthPx : undefined}
            color={'black'}/>
        <div ref={setSectionContainer} className={'character-timing-section'}>
            {characterTimings.map((videoCharacter, index) => {
                const props: {onClick?: (ev: React.MouseEvent<HTMLElement>) => void} = {};
                if (editMode) {
                    props.onClick = (ev: React.MouseEvent<HTMLElement>) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        manager.editingVideoMetadataService.editingCharacterIndex$.next(index + characterIndexStart);
                    }
                }
                return <PronunciationTimingCharacterComponent
                    key={index}
                    editingIndex={editingIndex}
                    index={index + characterIndexStart}
                    sectionDuration={sectionDurationMs}
                    videoCharacter={videoCharacter}
                    timeScale={videoMetaData.timeScale}
                    {...props} />;
            })}
        </div>
    </div>
}