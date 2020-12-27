import {DocumentWordData, TextWordData} from "../Atomized/TextWordData";
import {AtomizedDocumentDocumentStats, AtomizedDocumentStats} from "../Atomized/AtomizedDocumentStats";

export function getAtomizedDocumentDocumentStats(stats: AtomizedDocumentStats, name: string): AtomizedDocumentDocumentStats {
    return {
        ...stats,
        documentWordCounts: Object.fromEntries(
            Object.entries(stats.wordCounts).map(([word, count]) => [word, {count, word, document: name}])
        )
    }
}

export function getDocumentWordData(stats: TextWordData, name: string): DocumentWordData {
    return {
        ...stats,
        documentWordCounts: Object.fromEntries(
            Object.entries(stats.wordCounts).map(([word, count]) => [word, [{count, word, document: name}]])
        )
    }
}