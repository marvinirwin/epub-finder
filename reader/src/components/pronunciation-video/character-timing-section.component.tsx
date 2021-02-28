import React, {useContext, useEffect, useState} from "react";
import {usePlaceHighlightBar} from "./usePlaceHighlightBar";
import {TemporalPositionBarComponent} from "./temporal-position-bar.component";
import {HighlightBarComponent} from "./highlight-bar.component";
import {VideoCharacter} from "./video-character.interface";
import {ManagerContext} from "../../App";
import {useObservableState, useSubscription} from "observable-hooks";
import {PronunciationTimingCharacterComponent} from "./pronunciation-character.component";
import {useDebouncedFn, useResizeObserver} from "beautiful-react-hooks";
import {VideoMetadata} from "../../types/";
import {draw} from "./draw-sine-wav";
import {filterData, normalizeData} from "../../lib/audio/AudioGraphing";

export type Percentage = number;
const urlParams = new URLSearchParams(window.location.search);
const editMode = !!urlParams.get('edit')

export const CharacterTimingSectionComponent: React.FunctionComponent<{
    characterTimings: VideoCharacter[],
    videoMetaData: VideoMetadata,
    chunkSizeMs: number,
    progressBarFraction: number | undefined,
    highlightStartPosition: number,
    highlightEndPosition: number,
    onClick: (p: Percentage) => void,
    onMouseDown: (n: Percentage) => void,
    onMouseOver: (n: Percentage) => void,
    onMouseUp: (n: Percentage) => void,
    sectionIndex: number,
    characterIndexStart: number,
    audioBuffer: AudioBuffer | undefined,
    sectionWidth: number | undefined
    normalMax: number | undefined
}> = ({
          characterTimings,
          videoMetaData,
          chunkSizeMs,
          progressBarFraction,
          onClick,
          highlightStartPosition,
          highlightEndPosition,
          onMouseDown,
          onMouseOver,
          onMouseUp,
          sectionIndex,
          characterIndexStart,
          audioBuffer,
    sectionWidth,
    normalMax
      }) => {
    const [canvas, setCanvasRef] = useState<HTMLCanvasElement | null>();
    const [sectionContainer, setSectionContainer] = useState<HTMLDivElement | null>();
    const [hoverBarFraction, setHoverBarFraction] = useState<number | undefined>(undefined);
    const [highlightBar, setHighlightBar] = useState<HTMLDivElement | null>();
    usePlaceHighlightBar(highlightBar, sectionContainer, highlightStartPosition, highlightEndPosition);
    const manager = useContext(ManagerContext);
    const editingIndex = useObservableState(manager.editingVideoMetadataService.editingCharacterIndex$);
    const editing = videoMetaData && editingIndex !== undefined && editingIndex >= 0;
    const sectionDurationSeconds = chunkSizeMs / 1000;

    const onDropOver = (dragClientX: number, containerLeft: number, containerWidth: number) => {
        if (editing) {
            const positionFraction = (dragClientX - containerLeft) / containerWidth;
            const newTimestamp = (positionFraction * chunkSizeMs) + chunkSizeMs * sectionIndex;
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
        if (canvas && audioBuffer && normalMax) {
            const sectionPadding = 24 * 2;
            canvas.width = (canvas.parentElement?.clientWidth || 240) - sectionPadding;
            canvas.height = 50;
            draw(
                normalizeData(filterData(audioBuffer, 1000), normalMax),
                canvas,
                audioBuffer.duration / sectionDurationSeconds
            )
        }
    }, [audioBuffer, canvas, sectionWidth]);

    const canvasWidth = canvas?.width || 0;


    return <div className={'character-timing-section-container'}
                ref={el => manager.introService.sectionsRef$.next(el)}
                onMouseLeave={() => {
                    setHoverBarFraction(undefined);
                }}
                onMouseMove={ev => {
                    /**
                     * To get where the hoverBar is supposed to be take the clientX and subtract the clientX of the canvas
                     */
                    if (canvas) {
                        const canvasWidth = canvas.getBoundingClientRect();
                        const fraction = (ev.clientX - canvasWidth.x) / canvas.clientWidth;
                        setHoverBarFraction(fraction);
                        onMouseOver(fraction);
                    }
                }}
                onClick={ev => {
                    if (canvas) {
                        const canvasRect = canvas.getBoundingClientRect();
                        onClick(((ev.clientX - canvasRect.x) / canvas.clientWidth))
                    }
                }}
                onMouseDown={ev => {
                    if (canvas) {
                        const canvasRect = canvas.getBoundingClientRect();
                        onMouseDown((ev.clientX - canvasRect.x) / canvas.clientWidth)
                    }
                }}
                onMouseUp={ev => {
                    if (canvas) {
                        const canvasRect = canvas.getBoundingClientRect();
                        onMouseUp((ev.clientX - canvasRect.x) / canvas.clientWidth)
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
        <canvas ref={setCanvasRef}/>
        <HighlightBarComponent setHighlightBar={setHighlightBar}/>
        <TemporalPositionBarComponent
            position={hoverBarFraction ? ((hoverBarFraction * canvasWidth) + 24 ) : undefined}
            color={'blue'}/>
        <TemporalPositionBarComponent
            position={progressBarFraction ? (progressBarFraction * canvasWidth) + 24 : undefined}
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
                    sectionDuration={chunkSizeMs}
                    videoCharacter={videoCharacter}
                    timeScale={videoMetaData.timeScale}
                    {...props} />;
            })}
        </div>
    </div>
}