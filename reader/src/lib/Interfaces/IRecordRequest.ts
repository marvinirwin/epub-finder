import {WavAudio} from "../WavAudio";

export interface IRecordRequest {
    duration: number;
    cb: (c: WavAudio) => void;
    label: string;
}