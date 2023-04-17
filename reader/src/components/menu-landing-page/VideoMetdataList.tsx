import React, {useContext, useState} from "react";
import {ManagerContext} from "../../App";
import {VideoCharacter} from "@shared/*";
import {useObservableState} from "observable-hooks";

export interface VideoMetadata {
    sentence: string;
    timeScale: number;
    characters: VideoCharacter[];
    filename?: string;
    audioFilename?: string;
}

export function VideoMetdataList() {
    const m = useContext(ManagerContext);
    const videoMetadataList: VideoMetadata[] = Array.from((useObservableState(m.videoMetadataRepository.all$) || new Map())?.values());
    const onCLick = (videoMetadata: VideoMetadata) => {
        m.pronunciationVideoService.videoMetadata$.next(
            videoMetadata
        )
        m.pronunciationVideoService.setVideoPlaybackTime$.next(
            0
        )
    }
    return (
        <table>
            <thead>
            <tr>
                <th>Sentence</th>
                <th>Time Scale</th>
                <th>Characters</th>
                <th>Filename</th>
                <th>Audio Filename</th>
            </tr>
            </thead>
            <tbody>
            {videoMetadataList.map((videoMetadata) => (
                <tr key={videoMetadata.sentence} onClick={() => onCLick(videoMetadata)}>
                    <td>{videoMetadata.sentence}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}