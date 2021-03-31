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
    tabulatedSentenceToTabulatedDocuments,
} from '@shared/'
import trie from 'trie-prefix-tree'
import { SetWithUniqueLengths } from '../../../../server/src/shared/tabulate-documents/set-with-unique-lengths'
import { resolvePartialTabulationConfig } from '../language/language-maps/word-separator'

// @ts-ignore
self.window = self
// @ts-ignore
const ctx: Worker = self as any

ctx.onmessage = async (ev) => {
    const {
        words,
        notableSubsequences,
        d,
        languageCode,
    }: TabulateRemoteDocumentDto = ev.data
    const ltDoc = new LtDocument(d)
    const response = await fetch(
        `${process.env.PUBLIC_URL}/documents/${ltDoc.filename}`,
    )
    const documentSrc = new TextDecoder().decode(await response.arrayBuffer())
    const doc = AtomizedDocument.atomizeDocument(documentSrc)
    const tabulated = tabulatedSentenceToTabulatedDocuments({
        tabulatedSentences: tabulate({
            greedyWordSet: new SetWithUniqueLengths(words),
            notableCharacterSequences: new SetWithUniqueLengths(
                notableSubsequences,
            ),
            segments: doc.segments(),
            ...resolvePartialTabulationConfig(languageCode),
            languageCode,
        }),
        label: ltDoc.name,
        id: ltDoc.id(),
    })
    ctx.postMessage({
        wordCounts: tabulated.wordCounts,
        wordSegmentStringsMap: tabulated.wordSegmentStringsMap,
        documentWordCounts: tabulated.documentWordCounts,
        greedyDocumentWordCounts: tabulated.greedyDocumentWordCounts,
        segmentWordCountRecordsMap: tabulated.segmentWordCountRecordsMap,
        greedyWordCounts: tabulated.greedyWordCounts,
        id: ltDoc.id(),
        label: ltDoc.name,
    } as SerializedDocumentTabulation)
}
