import {Observable} from "rxjs";
import {TrieWrapper} from "../TrieWrapper";
import {flatMap, map, scan, shareReplay, switchMap} from "rxjs/operators";
import {AtomizedDocument} from "./AtomizedDocument";
import {AtomizedDocumentStats} from "./AtomizedDocumentStats";
import {GetWorkerResults} from "../Util/GetWorkerResults";
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import AtomizeSrcdoc from 'Worker-loader?name=dist/[name].js!../Worker/AtomizeSrcdoc';

import {jestDetected} from "../Util/Util";

export const cache = new Map<string, AtomizedDocument>();
export const AtomizeSrcDocPipe = (docAndTrie: Observable<[string, TrieWrapper]>): Observable<AtomizedDocumentStats> => {
    if (jestDetected()) {
        return docAndTrie.pipe(
            map(([unAtomizedDocument, trie]) => {
                if (!cache.get(unAtomizedDocument)) {
                    cache.set(
                        unAtomizedDocument,
                        AtomizedDocument.atomizeDocument(unAtomizedDocument),
                    );
                }
                return (cache.get(unAtomizedDocument) as AtomizedDocument).getDocumentStats(trie)
            }),
            shareReplay(1)
        );
    }

    return docAndTrie.pipe(
        switchMap(async ([unAtomizedDocument, trie]) => {
            if (!cache.get(unAtomizedDocument)) {
                cache.set(
                    unAtomizedDocument,
                    new AtomizedDocument(
                        (new DOMParser())
                            .parseFromString(
                                await GetWorkerResults(
                                    new AtomizeSrcdoc(),
                                    unAtomizedDocument
                                ),
                                'text/html'
                            )
                    ),
                );
            }
            return (cache.get(unAtomizedDocument) as AtomizedDocument).getDocumentStats(trie)
        }),
        shareReplay(1)
    );
}
