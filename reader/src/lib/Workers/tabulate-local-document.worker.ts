/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {AtomizedDocument} from "@shared/";
import {Segment, SerializedTabulation, tabulatedSentenceToTabulatedDocuments} from "@shared/";
import trie from "trie-prefix-tree";
import {TabulateLocalDocumentDto} from "./tabulate-local-document.dto";

// @ts-ignore
self.window = self;
// @ts-ignore
const ctx: Worker = self as any;

ctx.onmessage = async (ev) => {
    const {trieWords, src, label}: TabulateLocalDocumentDto = ev.data;
    const doc = AtomizedDocument.atomizeDocument(src);
    const t = trie(trieWords);
    const segments = doc.segments();
    const tabulatedSentences = Segment.tabulate(
        t,
        segments,
    );
    try {
        const tabulated = tabulatedSentenceToTabulatedDocuments(tabulatedSentences, label);
        ctx.postMessage({
            wordCounts: tabulated.wordCounts,
            wordSegmentStringsMap: tabulated.wordSegmentStringsMap,
        } as SerializedTabulation);
    } catch(e) {
        console.error(e);
        ctx.postMessage(
            {
                documentWordCounts: {},
                wordElementsMap: {},
                wordSegmentMap: {},
                segments: [],
                atomMetadatas: new Map(),
                wordCounts: {},
                wordSegmentStringsMap: new Map()
            }
        )
    }
};

