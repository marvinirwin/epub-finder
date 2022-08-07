/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {
    AtomizedDocument,
    SerializedDocumentTabulation,
    tabulate,
} from '@shared/'
import { TabulateLocalDocumentDto } from './tabulate-local-document.dto'
import { SetWithUniqueLengths } from '@shared/'
import { resolvePartialTabulationConfig } from "@shared/"

// @ts-ignore
self.window = self
// @ts-ignore
const ctx: Worker = self as any

ctx.onmessage = async (ev) => {
    const {
        words,
        notableSubsequences,
        src,
        label,
        id,
        language_code,
    }: TabulateLocalDocumentDto = ev.data
    const doc = AtomizedDocument.fromAtomizedString(src)
    const segments = doc.segments()
    const tabulated = await tabulate({
        greedyWordSet: new SetWithUniqueLengths(words),
        notableCharacterSequences: new SetWithUniqueLengths(
            notableSubsequences,
        ),
        segments,
        ...resolvePartialTabulationConfig(language_code),
        language_code,
    });
    try {
        ctx.postMessage({
            wordSegmentSubSequencesMap: tabulated.wordSegmentSubSequencesMap,
            notableSubSequences: tabulated.notableSubSequences,
            segmentWordCountRecordsMap: tabulated.segmentWordCountRecordsMap,
            id,
            label,
        } as SerializedDocumentTabulation)
    } catch (e) {
        console.error(e)
        ctx.postMessage({
            wordElementsMap: {},
            wordSegmentMap: {},
            segments: [],
            atomMetadatas: new Map(),
            wordSegmentSubSequencesMap: new Map(),
            greedyDocumentWordCounts: new Map(),
            segmentWordCountRecordsMap: new Map(),
            notableSubSequences: [],
            id,
            label,
        } as SerializedDocumentTabulation)
    }
}
