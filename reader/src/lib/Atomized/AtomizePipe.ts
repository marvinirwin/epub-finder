import {Observable} from "rxjs";
import {TrieWrapper} from "../TrieWrapper";
import {map, scan, shareReplay} from "rxjs/operators";
import {AtomizedDocument} from "./AtomizedDocument";
import {AtomizedDocumentStats} from "./AtomizedDocumentStats";

export const AtomizePipe = (docAndTrie: Observable<[string, TrieWrapper]>): Observable<AtomizedDocumentStats> =>
    docAndTrie.pipe(
        map(([unAtomizedDocument, trie]) => {
            const doc = AtomizedDocument.atomizeDocument(unAtomizedDocument);
            return doc.getDocumentStats(trie);
        }),
        shareReplay(1)
    )
