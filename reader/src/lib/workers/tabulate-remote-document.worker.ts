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
import { SetWithUniqueLengths } from '../../../../server/src/shared/tabulate-documents/set-with-unique-lengths'
import { resolvePartialTabulationConfig } from '../../../../server/src/shared/tabulation/word-separator'

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
        `${process.env.PUBLIC_URL}/api/documents/${ltDoc.filename}`,
    )
    const documentSrc = new TextDecoder().decode(await response.arrayBuffer())
    const doc = AtomizedDocument.atomizeDocument({documentId: ltDoc.id(), documentSrc})
    const segments = doc.segments();
    const tabulated = tabulate({
        greedyWordSet: new SetWithUniqueLengths(words),
        notableCharacterSequences: new SetWithUniqueLengths(
            notableSubsequences,
        ),
        segments,
        ...resolvePartialTabulationConfig(language_code),
        language_code,
    })
    ctx.postMessage({
        wordSegmentSubSequencesMap: tabulated.wordSegmentSubSequencesMap,
        notableSubSequences: tabulated.notableSubSequences,
        segmentWordCountRecordsMap: tabulated.segmentWordCountRecordsMap,
        id: ltDoc.id(),
        label: ltDoc.name,
    } as SerializedDocumentTabulation)
}
