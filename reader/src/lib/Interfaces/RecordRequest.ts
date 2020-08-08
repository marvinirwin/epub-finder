import {WavAudio} from "../WavAudio";

export interface RecordRequest {
    duration: number;
    cb: (c: string) => void;
    label: string;
}