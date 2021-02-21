import {SerializedTabulation} from "../src/shared";
import {SimilarityResults} from "../src/shared/compre-similarity-result";
import {computeSimilarityTabulation} from "../src/shared/similarity-result.interface";

const tabulatedSimplifiedChineseDocuments: SerializedTabulation = {
    wordCounts: {
         '天气' : 1,
         '今天' : 2,
         '今' : 2,
         '天' : 3,
         '气' : 1
    }
};

const tabulatedSimplifiedChineseDocuments2: SerializedTabulation = {
    wordCounts: {
        '天气' : 3,
        '天' : 3,
        '气' : 3
    }
};



describe('Comparing the word frequencies of two documents', () => {
    it('Computes a similarity tabulation between two documents', () => {
        expect(
            computeSimilarityTabulation(
                tabulatedSimplifiedChineseDocuments,
                tabulatedSimplifiedChineseDocuments2
            )
        ).toMatchObject({
            knownWords: tabulatedSimplifiedChineseDocuments2.wordCounts,
            unknownWords: {}
        } as SimilarityResults)
        expect(
            computeSimilarityTabulation(
                tabulatedSimplifiedChineseDocuments2,
                tabulatedSimplifiedChineseDocuments
            )
        ).toMatchObject({
            knownWords: {
                '天气' : 1,
                '天' : 3,
                '气' : 1
            },
            unknownWords: {
                '今天': 2,
                '今': 2
            }
        } as SimilarityResults)
    })
})