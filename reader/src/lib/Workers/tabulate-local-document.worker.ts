/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {AtomizedDocument, Segment, SerializedTabulation, tabulatedSentenceToTabulatedDocuments} from "@shared/";
import {TabulateLocalDocumentDto} from "./tabulate-local-document.dto";
import {SetWithUniqueLengths} from "../../../../server/src/shared/tabulate-documents/set-with-unique-lengths";

// @ts-ignore
self.window = self;
// @ts-ignore
const ctx: Worker = self as any;

ctx.onmessage = async (ev) => {
    const {trieWords, src, label}: TabulateLocalDocumentDto = ev.data;
    const doc = AtomizedDocument.atomizeDocument(src);
    const segments = doc.segments();
    const tabulatedSentences = Segment.tabulate(
        new SetWithUniqueLengths(trieWords),
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

