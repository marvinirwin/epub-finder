/* eslint import/no-webpack-loader-syntax:0 */
import { GetWorkerResults } from '../util/GetWorkerResults'
// @ts-ignore
import AtomizeSrcdocWorker from 'Worker-loader?name=dist/[name].js!./atomized-document-from-src.worker'
// @ts-ignore
import TabulateRemoteDocumentWorker from 'Worker-loader?name=dist/[name].js!./tabulate-remote-document.worker'
// @ts-ignore
import TabulateLocalDocumentWorker from 'Worker-loader?name=dist/[name].js!./tabulate-local-document.worker'
// @ts-ignore
import AtomizeUrlWorker from 'Worker-loader?name=dist/[name].js!./atomized-document-from-url.worker'
import {
    AtomizedDocumentFromUrlParams, AtomizeSrcDocParams,
    InterpolateService,
    SerializedDocumentTabulation,
    SerializedTabulation,
} from '@shared/'
import { TabulateRemoteDocumentDto } from './tabulate-remote-document.dto'
import { TabulateLocalDocumentDto } from './tabulate-local-document.dto'

export type WorkerError = { errorMessage: string }

export const AtomizeHtml = (HTMLString: AtomizeSrcDocParams) => {
    return GetWorkerResults<string | WorkerError>(
      new Worker(new URL("atomized-document-from-url.worker.ts", import.meta.url)),
      HTMLString
    ).then(handleWorkerError);
}

export const AtomizeUrl = async (url: AtomizedDocumentFromUrlParams) => {
    return GetWorkerResults<string | WorkerError>(new Worker(new URL('./atomized-document-from-url.worker.ts', import.meta.url)), url)
        .then(handleWorkerError)
}

export const TabulateRemoteDocument = async (dto: TabulateRemoteDocumentDto) => {
    return GetWorkerResults<SerializedTabulation>(
      new Worker(new URL("./tabulate-remote-document.worker.ts", import.meta.url)),
      dto
    ).then((result: SerializedTabulation) => {
        return result;
    });
}

export const TabulateLocalDocument = async (dto: TabulateLocalDocumentDto) => {
    return GetWorkerResults<SerializedDocumentTabulation>(
      new Worker(new URL("./tabulate-local-document.worker.ts", import.meta.url), ),
      dto
    ).then((result: SerializedDocumentTabulation) => {
        return result;
    });
}

export const AtomizeUrlKey = (url: string) => `ATOMIZED_URL_${url}`

const handleWorkerError = (r: string | WorkerError) => {
    if (typeof r === 'string') {
        return r
    }
    return InterpolateService.text(r.errorMessage)
}
