import React, {useContext} from "react";
import {VideoCharacter} from "./video-character.interface";
import {percentagePosition} from "./math.module";
import {ManagerContext} from "../../App";

const urlParams = new URLSearchParams(window.location.search);
const editMode = !!urlParams.get('edit')

export const PronunciationTimingCharacterComponent: React.FC<{
    editingIndex: number | undefined,
    index: number,
    sectionDuration: number,
    videoCharacter: VideoCharacter,
    timeScale: number,
    onClick?: (ev: React.MouseEvent<HTMLElement>) => void
}> =
    ({
         editingIndex,
         index,
         sectionDuration,
         videoCharacter,
        timeScale,
        onClick
     }) => {
    const manager = useContext(ManagerContext);
        return <mark
            className={`character-timing-mark ${editingIndex === index ? "editing-character" : ""} ${editMode ? 'edit-mode' : ''}`}
            style={
                {
                    left: `${percentagePosition(sectionDuration, videoCharacter.timestamp * timeScale)}%`,
                }
            }
            onClick={(ev: React.MouseEvent<HTMLElement>) => editMode && onClick?.(ev)}
            onDragStart={() =>
                editMode && manager.editingVideoMetadataService.editingCharacterIndex$.next(index)
            }
            draggable={editMode}
        >{videoCharacter.character}
        </mark>;
    }