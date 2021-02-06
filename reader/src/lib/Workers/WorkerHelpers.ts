/* eslint import/no-webpack-loader-syntax:0 */
import {GetWorkerResults} from "../Util/GetWorkerResults";
// @ts-ignore
import AtomizeSrcdocWorker from 'Worker-loader?name=dist/[name].js!./AtomizedDocumentStringFromSrcDoc';
// @ts-ignore
import IdentifySubSequencesWorker from 'Worker-loader?name=dist/[name].js!./notable-subsequences.worker';
// @ts-ignore
import AtomizeUrlWorker from 'Worker-loader?name=dist/[name].js!./AtomizedDocumentStringFromURL';
import {InterpolateService} from "@shared/";
import {SubSequenceReturn} from "../subsequence-return.interface";

export type WorkerError = { errorMessage: string };

export const AtomizeHtml = (HTMLString: string) =>
    GetWorkerResults<string | WorkerError>(new AtomizeSrcdocWorker(), HTMLString)
        .then(handleWorkerError);

export const AtomizeUrl = async (url: string) => {
    return GetWorkerResults<string | WorkerError>(new AtomizeUrlWorker(), url)
        .then(handleCacheSuccessfulAtomizeUrl(url))
        .then(handleWorkerError)
};

export const IdentifySubsequences = async (text: string) => GetWorkerResults<SubSequenceReturn  | WorkerError>(new IdentifySubSequencesWorker(), text)
    .then((result: SubSequenceReturn | WorkerError) => {
        if ((result as WorkerError).errorMessage !== undefined) {
            return {popularStrings: [], characterSet: []};
        }
        return result as SubSequenceReturn;
    })


function handleCacheSuccessfulAtomizeUrl(url: string) {
    return (result: string | WorkerError) => {
        return result;
    };
}

export const AtomizeUrlKey = (url: string) => `ATOMIZED_URL_${url}`;

const handleWorkerError = (r: string | WorkerError) => {
    if (typeof r === 'string') {
        return r;
    }
    return InterpolateService.text(r.errorMessage)
}

