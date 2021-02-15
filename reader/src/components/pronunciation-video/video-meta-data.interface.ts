import {VideoCharacter} from "./video-character.interface";

export interface VideoMetadata {
    sentence: string;
    timeScale: number;
    characters: VideoCharacter[];
    filename?: string;
    audioFilename?: string;
}
