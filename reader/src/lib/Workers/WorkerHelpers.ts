/* eslint import/no-webpack-loader-syntax:0 */
import {GetWorkerResults} from "../Util/GetWorkerResults";
// @ts-ignore
import AtomizeSrcdocWorker from 'Worker-loader?name=dist/[name].js!./AtomizedDocumentStringFromSrcDoc';
// @ts-ignore
import AtomizeUrlWorker from 'Worker-loader?name=dist/[name].js!./AtomizedDocumentStringFromURL';

export const AtomizeSrcDoc: (s: string) => Promise<string[]> = async (HTMLString: string) => {
    return GetWorkerResults<string[]>(new AtomizeSrcdocWorker(), HTMLString);
};

export const AtomizeUrl: (s: string) => Promise<string[]> =
    async (url: string) => {
        const storedArray = JSON.parse(localStorage.getItem(AtomizeUrlKey(url)) || '[]');
        return storedArray.length ? storedArray :
            GetWorkerResults<string[]>(new AtomizeUrlWorker(), url);
    };


export const AtomizeUrlKey = (url: string) => `ATOMIZED_URL_${url}`;

