import {Observable} from "rxjs";
import {TrieWrapper} from "../TrieWrapper";
import {flatMap, map, scan, shareReplay, switchMap} from "rxjs/operators";
import {AtomizedDocument} from "./AtomizedDocument";
import {AtomizedDocumentStats} from "./AtomizedDocumentStats";
import {GetWorkerResults} from "../Util/GetWorkerResults";
// @ts-ignore
import AtomizeSrcdoc from 'Worker-loader?name=dist/[name].js!../Worker/AtomizeSrcdoc';
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import AtomizeUrl from 'Worker-loader?name=dist/[name].js!../Worker/AtomizeUrl';

import {jestDetected} from "../Util/Util";
import {UnitTestGetPageSrc, UnitTestGetPageSrcText} from "../../test/Util/Run";

export const cache = new Map<string, AtomizedDocument>();
export const AtomizeUrlPipe = (urlAndTrie: Observable<[string, TrieWrapper]>): Observable<AtomizedDocumentStats> => {
    if (jestDetected()) {
        return urlAndTrie.pipe(
            map(([url, trie]) => {
                if (!cache.get(url)) {
                    cache.set(
                        url,
                        AtomizedDocument.atomizeDocument(UnitTestGetPageSrcText(url)),
                    );
                }
                return (cache.get(url) as AtomizedDocument).getDocumentStats(trie)
            }),
            shareReplay(1)
        );
    }

    return urlAndTrie.pipe(
        switchMap(async ([url, trie]) => {
            if (!cache.get(url)) {
                cache.set(
                    url,
                    new AtomizedDocument(
                        (new DOMParser())
                            .parseFromString(
                                await GetWorkerResults(
                                    new AtomizeUrl(),
                                    url
                                ),
                                'text/html'
                            )
                    ),
                );
            }
            return (cache.get(url) as AtomizedDocument).getDocumentStats(trie)
        }),
        shareReplay(1)
    );
}
