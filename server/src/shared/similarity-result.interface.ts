import {SerializedTabulation} from "./index";
import {SimilarityResults} from "./compre-similarity-result";

export const computeSimilarityTabulation = (knownDocument: SerializedTabulation, unknownDocument: SerializedTabulation): SimilarityResults => ({
    // @ts-ignore
    knownWords: Object.fromEntries(
        Object.entries(knownDocument.wordCounts)
            .map(([word, count]) => [word, unknownDocument.wordCounts[word]])
            .filter(([word, count]) => !!count)
    ),
    // @ts-ignore
    unknownWords: Object.fromEntries(
        Object.entries(unknownDocument.wordCounts)
            .map(([word, count]) => [word, knownDocument.wordCounts[word]])
            .filter(([word, count]) => !count)
            .map(([word]) => [word, unknownDocument.wordCounts[word]])
    ),
});