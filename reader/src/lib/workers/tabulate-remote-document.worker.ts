/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import { TabulateRemoteDocumentDto } from './tabulate-remote-document.dto'
import {
    AtomizedDocument,
    LtDocument,
    Segment,
    SerializedDocumentTabulation,
    tabulate,
} from '@shared/'
import trie from 'trie-prefix-tree'
import { SetWithUniqueLengths } from "@shared/"
import { resolvePartialTabulationConfig } from "@shared/"
import { getApiUrl } from '../util/getApiUrl'
import {fetchWordSplit} from "../../services/translate.service";

// @ts-ignore
self.window = self
// @ts-ignore
const ctx: Worker = self as any

ctx.onmessage = async (ev) => {
    const {
        words,
        notableSubsequences,
        d,
        language_code,
    }: TabulateRemoteDocumentDto = ev.data
    const ltDoc = new LtDocument(d)
    const response = await fetch(
        getApiUrl("/api/documents/${ltDoc.filename}"),
    )
    const documentSrc = new TextDecoder().decode(await response.arrayBuffer())
    const doc = AtomizedDocument.atomizeDocument({documentId: ltDoc.id(), documentSrc})
    const segments = doc.segments();
    const tabulated = await tabulate({
        greedyWordSet: new SetWithUniqueLengths(words),
        notableCharacterSequences: new SetWithUniqueLengths(
            notableSubsequences,
        ),
        segments,
        ...resolvePartialTabulationConfig(language_code),
        language_code,
        wordSplitFunction: fetchWordSplit
    })
    ctx.postMessage({
        wordSegmentSubSequencesMap: tabulated.wordSegmentSubSequencesMap,
        notableSubSequences: tabulated.notableSubSequences,
        segmentWordCountRecordsMap: tabulated.segmentWordCountRecordsMap,
        id: ltDoc.id(),
        label: ltDoc.name,
    } as SerializedDocumentTabulation)
}
