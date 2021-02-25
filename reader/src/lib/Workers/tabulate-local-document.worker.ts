/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {AtomizedDocument} from "../../../../server/src/shared/tabulate-documents/atomized-document";
import {Segment, tabulatedSentenceToTabulatedDocuments} from "@shared/";
import trie from "trie-prefix-tree";
import {TabulateLocalDocumentDto} from "./tabulate-local-document.dto";

// @ts-ignore
self.window = self;
// @ts-ignore
const ctx: Worker = self as any;

ctx.onmessage = async (ev) => {
    const {trieWords, src, label}: TabulateLocalDocumentDto = ev.data;
    const doc = AtomizedDocument.atomizeDocument(src);
    const tabulated = tabulatedSentenceToTabulatedDocuments(Segment.tabulate(
        trie(trieWords),
        doc.segments(),
    ), label);
    ctx.postMessage(tabulated);
};

