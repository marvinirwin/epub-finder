/* eslint import/no-webpack-loader-syntax:0 */
import {GetWorkerResults} from "../Util/GetWorkerResults";
// @ts-ignore
import AtomizeSrcdocWorker from 'Worker-loader?name=dist/[name].js!./AtomizedDocumentStringFromSrcDoc';
// @ts-ignore
import AtomizeUrlWorker from 'Worker-loader?name=dist/[name].js!./AtomizedDocumentStringFromURL';
import {InterpolateService} from "@shared/";

export type WorkerError = { type: "error", message: string };

export const AtomizeHtml = (HTMLString: string) =>
    GetWorkerResults<string | WorkerError>(new AtomizeSrcdocWorker(), HTMLString)
        .then(handleWorkerError);

export const AtomizeUrl = async (url: string) => {
/*
    try {
        const cached = JSON.parse(localStorage.getItem(AtomizeUrlKey(url)) || '');
        if (cached) {
            return cached;
        }
    } catch(e) {
        console.warn(e);
    }
*/
    return GetWorkerResults<string | WorkerError>(new AtomizeUrlWorker(), url)
        .then(handleCacheSuccessfulAtomizeUrl(url))
        .then(handleWorkerError)
};

function handleCacheSuccessfulAtomizeUrl(url: string) {
    return (result: string | WorkerError) => {
/*
        if (typeof result === 'string') {
            localStorage.setItem(AtomizeUrlKey(url), result)
        }
*/
        return result;
    };
}

export const AtomizeUrlKey = (url: string) => `ATOMIZED_URL_${url}`;

const handleWorkerError = (r: string | WorkerError) => {
    if (typeof r === 'string') {
        return r;
    }
    return InterpolateService.text(r.message)
}

