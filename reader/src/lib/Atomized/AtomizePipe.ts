import {Observable} from "rxjs";
import {TrieWrapper} from "../TrieWrapper";
import {map, scan} from "rxjs/operators";
import {AtomizedDocument} from "./AtomizedDocument";
import {DOMParser} from "xmldom";
import {mergeSentenceInfo} from "./TextWordData";
import {AtomizedDocumentStats} from "./AtomizedDocumentStats";

export const AtomizePipe = (srcDoc$: Observable<[string, TrieWrapper]>): Observable<AtomizedDocumentStats> =>
    srcDoc$.pipe(
        map(([unAtomizedDocument, trie]) => {
            const doc = AtomizedDocument.atomizeDocument(unAtomizedDocument);
            return doc.getDocumentStats(trie);
        })
    )
