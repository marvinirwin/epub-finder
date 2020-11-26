import React, {useContext} from "react";
import {VideoCharacter} from "./video-character.interface";
import {percentagePosition} from "./math.module";
import {ManagerContext} from "../../App";

export const PronunciationTimingCharacterComponent: React.FC<{
    editingIndex: number | undefined,
    index: number,
    sectionDuration: number,
    videoCharacter: VideoCharacter,
    timeScale: number,
    onClick: (ev: React.MouseEvent<HTMLElement>) => void
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
            className={`character-timing-mark ${editingIndex === index ? "editing-character" : ""}`}
            style={
                {
                    left: `${percentagePosition(sectionDuration, videoCharacter.timestamp * timeScale)}%`,
                }
            }
            onClick={(ev: React.MouseEvent<HTMLElement>) => onClick(ev)}
            onDragStart={() =>
                manager.editingVideoMetadataService.editingCharacterIndex$.next(index)
            }
            draggable

        >{videoCharacter.character}
        </mark>;
    }