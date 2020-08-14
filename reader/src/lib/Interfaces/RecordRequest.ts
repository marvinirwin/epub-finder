import {WavAudio} from "../WavAudio";


export class RecordRequest {
    public sentence: Promise<string>;
    public resolveSentence!: ((value: string) => void);
    public rejectSentence!: ((reason?: any) => void);
    constructor(public label: string) {
        this.sentence = new Promise((resolve, reject) => {
            this.resolveSentence = resolve;
            this.rejectSentence = reject;
        })
    }
}
