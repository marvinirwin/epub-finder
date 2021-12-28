import { SerializedTabulation } from "./index";
import { SimilarityResults } from "./compre-similarity-result";

export const computeSimilarityTabulation = (
    knownDocument: SerializedTabulation,
    unknownDocument: SerializedTabulation,
): SimilarityResults => ({
    knownWords: {},
    unknownWords: {},
});
