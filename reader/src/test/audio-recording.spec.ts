import {convertGraphToOrderables, getTestScheduler, mv, ord} from "./Util/Util";
import {RecordRequest} from "../lib/Interfaces/RecordRequest";
import {Run} from "./Util/Run";
import {Observable} from "rxjs";
import {AsciiGraph} from "./Util/GetGraphJson";


// Can I have multiple instances of this, or can I get away with this here?
const testScheduler = getTestScheduler();

it('Can fulfill an Audio Recording request ', async () => {
    Run(({
             manager: {
                 audioManager: {
                     audioRecorder: {
                         recordRequest$,
                         isRecording$
                     }
                 }
             }, scheduler, helpers: {hot}
         }) => {
        const recordRequest = new RecordRequest('test');
        const recordRequests$ = hot('a', {a: recordRequest});
        recordRequests$.subscribe(recordRequest$);

        type ObsValuePair<T> = [Observable<T>, T];

        function getOrderables(s: string, values: { [key: string]: ObsValuePair<any> }) {
            const valueMap = Object.fromEntries(
                Object.entries(values)
                    .map(([key, [obs$, value]]) => [key, value])
            );
            const g = new AsciiGraph(s);
            const roots = g.getRoots();
            const visited = new Set<string>();
            return roots.map(root => convertGraphToOrderables(g.edges, valueMap, root, visited));
        }

/*
        getOrderables(`
           c
           |
        ---b
        |  
        a   
        `, {
            a: recordRequest,
            b: true,
            c: false
        })(
*/
/*
            publisher([recordRequest]),
            subscriber([isRecording$])
        );

        scheduler.expectOrdering([
            ord(recordRequests$),
            ord(isRecording$)
        ]).toBe([
            mv('a', {a: RecordRequest}),
            mv('-bc', {values: {b: true, c: false}}),
        ]);
*/
    })
})

it("Starts recording Audio when an editing card is selected", async () => {
    Run(({
             manager: {
                 audioManager: {
                     audioRecorder: {
                         recordRequest$,
                         isRecording$
                     },
                 },
                 cardManager: {
                     addPersistedCards$
                 }
             }, scheduler, helpers: {hot}
         }) => {
        const recordRequest = new RecordRequest('test');
        const recordRequests$ = hot('a', {a: recordRequest});
        recordRequests$.subscribe(recordRequest$);
        scheduler.expectOrdering([
            ord(recordRequests$),
            ord(isRecording$)
        ]).toBe([
            mv('a', {a: RecordRequest}),
            mv('-bc', {values: {b: true, c: false}}),
        ]);
    })
});
