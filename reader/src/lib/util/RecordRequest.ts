import {ReplaySubject} from "rxjs";


export class RecordRequest {
     sentence: Promise<string>;
    public resolveSentence!: ((value: string) => void);
    public rejectSentence!: ((reason?: any) => void);
    public recording$ = new ReplaySubject<boolean>(1);
    public recording: boolean = false;
    constructor(public label: string) {
        this.recording$.subscribe(r => {
            this.recording = r;
        })
        this.sentence = new Promise((resolve, reject) => {
            this.resolveSentence = resolve;
            this.rejectSentence = reject;
        })
    }
}
