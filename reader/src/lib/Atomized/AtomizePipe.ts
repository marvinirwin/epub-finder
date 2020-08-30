import {Observable} from "rxjs";
import {TrieWrapper} from "../TrieWrapper";
import {flatMap, map, scan, shareReplay} from "rxjs/operators";
import {AtomizedDocument} from "./AtomizedDocument";
import {AtomizedDocumentStats} from "./AtomizedDocumentStats";
import {GetWorkerResults} from "../Util/GetWorkerResults";

export const cache = new Map<string, AtomizedDocument>();
export const AtomizePipe = (docAndTrie: Observable<[string, TrieWrapper]>): Observable<AtomizedDocumentStats> => {
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
