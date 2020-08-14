import {getTestScheduler, mv, ord} from "./Util/Util";
import {AudioRecorder} from "../lib/Audio/AudioRecorder";
import {UnitTestAudio} from "../lib/Audio/UnitTestAudio";
import {RecordRequest} from "../lib/Interfaces/RecordRequest";

require("fake-indexeddb/auto");

it('Can fulfill an Audio Recording request ', async () => {
    let testScheduler = getTestScheduler();
    testScheduler.run(({hot}) => {
        const r = new AudioRecorder(new UnitTestAudio("yeet"));
        const recordRequest = new RecordRequest('test');
        const recordRequests$ = hot('a', {a: recordRequest});

        recordRequests$.subscribe(r.recordRequest$);

        testScheduler.expectOrdering(
            [
                ord(recordRequests$),
                ord(r.isRecording$)
            ]
        ).toBe(
            [
                mv('a', {a: RecordRequest}),
                mv('-bc', {values: {b: true, c: false}}),
            ]
        );
    })
})
