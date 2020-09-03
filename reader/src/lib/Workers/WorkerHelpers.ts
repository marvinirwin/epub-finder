/* eslint import/no-webpack-loader-syntax:0 */
import {GetWorkerResults} from "../Util/GetWorkerResults";
// @ts-ignore
import AtomizeSrcdocWorker from 'Worker-loader?name=dist/[name].js!./AtomizedDocumentString';
// @ts-ignore
import AtomizeUrlWorker from 'Worker-loader?name=dist/[name].js!./AtomizedDocumentStringFromURL';

export const AtomizeSrcDoc = async (HTMLString: string) => GetWorkerResults(new AtomizeSrcdocWorker(), HTMLString);

export const AtomizeUrl = async (url: string) => localStorage.getItem(AtomizeUrlKey(url)) || GetWorkerResults(new AtomizeUrlWorker(), url);
export const AtomizeUrlKey = (url: string) => `ATOMIZED_URL_${url}`;
