import {from, Observable, ReplaySubject, Subject} from "rxjs";
import {flatMap, mergeMap, shareReplay, switchMap, withLatestFrom} from "rxjs/operators";
import React from "react";
import axios from "axios";
import {WavAudio} from "./WavAudio";
import {IRecordRequest} from "./Interfaces/IRecordRequest";



export const audioContext = new Promise<AudioContext>(resolve => {
    setTimeout(() => {
        resolve(new AudioContext())
    }, 100)
})

export const AUDIO_GRAPH_SAMPLE_SIZE = 50;

export const filterData = (audioBuffer: AudioBuffer, samples: number) => {
    const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
    const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
    const filteredData = [];
    for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i; // the location of the first sample in the block
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
            sum = sum + Math.abs(rawData[blockStart + j]) // find the sum of all the samples in the block
        }
        filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }
    return filteredData;
}

export const normalizeData = (filteredData: number[]) => {
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    return filteredData.map(n => n * multiplier);
}

export class AudioRecorder {
    recordRequest$ = new ReplaySubject<IRecordRequest>(1);
    mediaSource$: Observable<MediaStream>;
    canvas$ = new ReplaySubject<HTMLCanvasElement>(1);
    isRecording$ = new ReplaySubject<boolean>(1);
    userAudio$: Observable<WavAudio>;

    constructor() {
        this.mediaSource$ = from(navigator.mediaDevices.getUserMedia({audio: true}));

        /*
                this.audioChunks$ = this.blobs$.pipe(
                    flatMap(blob => new Response(blob).arrayBuffer()),
                    flatMap(buffer => audioContext.decodeAudioData(buffer))
                )
                this.graphDataChunks$ = this.audioChunks$.pipe(
                    map(chunk => filterData(chunk, 50)),
                    map(chunk => normalizeData(chunk)),
                )
        */
        this.userAudio$ = this.recordRequest$.pipe(
            withLatestFrom(this.mediaSource$, this.canvas$),
            flatMap(async ([req, source, canvas]: [IRecordRequest, MediaStream, HTMLCanvasElement]) => {
                this.isRecording$.next(true);
                try {
                    const canvasCtx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
                    const recorder = new MediaRecorder(source);
                    const stream = (await audioContext).createMediaStreamSource(recorder.stream);
                    return new Promise<WavAudio>(async resolve => {
                        recorder.ondataavailable = async (event) => {
                            this.isRecording$.next(false);
                            let wavAudio = new WavAudio(await new Response(new Blob([event.data])).arrayBuffer());
                            debugger;
                            req.cb(wavAudio)
                            resolve(wavAudio);
                        }
                        const analyser = (await audioContext).createAnalyser();
                        analyser.fftSize = 2048;
                        const bufferLength = analyser.frequencyBinCount;
                        const dataArray = new Uint8Array(bufferLength);
                        stream.connect(analyser).connect((await audioContext).destination);
                        const draw = () => {
                            const WIDTH = canvas.width
                            const HEIGHT = canvas.height;

                            requestAnimationFrame(draw);

                            analyser.getByteTimeDomainData(dataArray);

                            canvasCtx.fillStyle = 'rgb(200, 200, 200)';
                            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                            canvasCtx.lineWidth = 2;
                            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

                            canvasCtx.beginPath();

                            let sliceWidth = WIDTH * 1.0 / bufferLength;
                            let x = 0;


                            for (let i = 0; i < bufferLength; i++) {

                                let v = dataArray[i] / 128.0;
                                let y = v * HEIGHT / 2;

                                if (i === 0) {
                                    canvasCtx.moveTo(x, y);
                                } else {
                                    canvasCtx.lineTo(x, y);
                                }

                                x += sliceWidth;
                            }

                            canvasCtx.lineTo(canvas.width, canvas.height / 2);
                            canvasCtx.stroke();

                        }
                        draw();
                        recorder.start();
                        setTimeout(() => recorder.stop(), req.duration * 1000 * 2)
                    })
                } catch (e) {
                    console.error(e);
                    this.isRecording$.next(false);
                    throw e;
                }
            })
        )
        /*
                this.graphData$ = this.finishedRecordingData.pipe(
                    flatMap(async (recordingData: Blob) => {
                        const blob = new Blob([recordingData], {type: 'audio/wav'})
                        const buffer = await (new Response(blob)).arrayBuffer();
                        const wav = new WavAudio(buffer, ))
                        try {
                            return await audioContext.decodeAudioData(buffer)
                        } catch (e) {
                            console.log("Error decoding user audio")
                            console.error(e);
                        }
                        return;
                    }),
                    filter(v => !!v),
                    map(d => {
                        // @ts-ignore
                        return normalizeData(filterData(d, AUDIO_GRAPH_SAMPLE_SIZE));
                    })
                )
        */
    }

    getRecording(text: string, duration: number): Promise<WavAudio> {
        return new Promise(resolve => {
            this.recordRequest$.next({
                label: text,
                cb: resolve,
                duration
            })
        })
    }
}

export function spaceOutRecording() {

}

export async function getSynthesizedAudio(text: string): Promise<WavAudio> {
    const response = await axios.post('/get-speech', {text}, {responseType: 'blob'});
    const buffer = await new Response(response.data as Blob).arrayBuffer()
/*
    const b = new Blob([response.data as Blob], {type: 'audio/wav'})
    const buffer =
*/
    return new WavAudio(buffer);
}

export class AudioTest {
    text$ = new ReplaySubject<string>(1);
    synthesizedAudio$: Observable<WavAudio>;
    /*
        userAudioNumbers$: Observable<number[]>;
    */
    synthesizedGraphData$: Observable<number[]>

    constructor() {
        this.synthesizedAudio$ = this.text$.pipe(
            flatMap(async text => {
                return await getSynthesizedAudio(text);
            }),
            shareReplay(1)
        );
        /*
                this.synthesizedAudio$.subscribe(v => v.el.play())
                this.userAudioNumbers$ = this.synthesizedAudio$.pipe(
                    switchMap(
                        (wav: WavAudio) => {
                            const rec = new AudioRecorder();
                            rec.rec(wav.duration$ * 1000 * 2)
                            return rec.graphData$
                        }
                    ),
                    shareReplay(1)
                );
        */
        this.synthesizedGraphData$ = this.synthesizedAudio$.pipe(
            switchMap(v => v.graphData$)
        )
    }

}

/*
export function AudioRecording({t}: { t: AudioTest }) {
    const userNumbers = useObs(t.userAudioNumbers$);
    const synthesizeNumbers = useObs(t.synthesizedGraphData$);
    const [rev, setRev] = useState(0);
    useEffect(() => {
            setRev(rev + 1)
        },
        [userNumbers, synthesizeNumbers])
    return <div>
        <Plot data={
            [userNumbers || [], synthesizeNumbers || []].map((stream, i) => {
                return {
                    x: stream.map((_, i) => i + 1),
                    y: stream,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: ['red', 'green']},
                }
            })
        } layout={{width: 320, height: 240, title: 'Sound recording'}}
              revision={rev}
        />
    </div>
}*/
