/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {
    AtomizedDocument,
    Segment,
    SerializedDocumentTabulation,
    SerializedTabulation,
    tabulatedSentenceToTabulatedDocuments
} from "@shared/";
import {TabulateLocalDocumentDto} from "./tabulate-local-document.dto";
import {SetWithUniqueLengths} from "../../../../server/src/shared/tabulate-documents/set-with-unique-lengths";
import {DocumentWordCount} from "../../../../server/src/shared/DocumentWordCount";
import {SerializedSegment, WordCountRecord} from "../../../../server/src/shared/tabulation/tabulate";

// @ts-ignore
self.window = self;
// @ts-ignore
const ctx: Worker = self as any;

ctx.onmessage = async (ev) => {
    const {words, notableSubsequences, src, label}: TabulateLocalDocumentDto = ev.data;
    const doc = AtomizedDocument.atomizeDocument(src);
    const segments = doc.segments();
    const tabulatedSentences = Segment.tabulate(
        {
            greedyWordSet: new SetWithUniqueLengths(words),
            notableCharacterSequences: new SetWithUniqueLengths(notableSubsequences),
            segments,
        }
    );
    try {
        const tabulated = tabulatedSentenceToTabulatedDocuments(tabulatedSentences, label);
        ctx.postMessage({
            wordCounts: tabulated.wordCounts,
            wordSegmentStringsMap: tabulated.wordSegmentStringsMap,
            documentWordCounts: tabulated.documentWordCounts,
            greedyDocumentWordCounts: tabulated.greedyDocumentWordCounts,
            segmentWordCountRecordsMap: tabulated.segmentWordCountRecordsMap
        } as SerializedDocumentTabulation);
    } catch (e) {
        console.error(e);
        ctx.postMessage(
            {
                documentWordCounts: {},
                wordElementsMap: {},
                wordSegmentMap: {},
                segments: [],
                atomMetadatas: new Map(),
                wordCounts: {},
                wordSegmentStringsMap: new Map(),
                greedyDocumentWordCounts: new Map(),
                segmentWordCountRecordsMap: new Map()
            }
        )
    }
};

