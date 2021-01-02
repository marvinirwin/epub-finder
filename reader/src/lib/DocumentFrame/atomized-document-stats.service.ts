import {AtomizedDocumentDocumentStats, AtomizedDocumentStats} from "../Atomized/AtomizedDocumentStats";
import {DocumentDataIndex} from "../Atomized/document-data-index.interfaec";

export function getAtomizedDocumentDocumentStats(stats: AtomizedDocumentStats, name: string): AtomizedDocumentDocumentStats {
    return {
        ...stats,
        documentWordCounts: Object.fromEntries(
            Object.entries(stats.wordCounts).map(([word, count]) => [word, {count, word, document: name}])
        )
    }
}

export function getTextWordData(stats: DocumentDataIndex, name: string): DocumentDataIndex {
    return {
        ...stats,
        documentWordCounts: Object.fromEntries(
            Object.entries(stats.wordCounts).map(([word, count]) => [word, [{count, word, document: name}]])
        )
    }
}