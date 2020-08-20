import {GetWorkerResults} from "../Util/GetWorkerResults";
import {BookFrame} from "../BookFrame/BookFrame";
import {from, Observable} from "rxjs";
import {Website} from "../Website/Website";
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import AtomizeUrl from 'Worker-loader?name=dist/[name].js!../Worker/AtomizeUrl';
import {AtomizedDocument} from "../Atomized/AtomizedDocument";

export function WorkerAtomize(page: Website): Observable<BookFrame> {
    return from(new Promise<BookFrame>(async resolve => {
        const documentProcessingWorker = new AtomizeUrl();
        const document = await GetWorkerResults(documentProcessingWorker, page.url);
        resolve(new BookFrame(
            document,
            page.name,
        ))
    }))
}
