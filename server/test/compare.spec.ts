import {SerializedTabulation} from "../src/shared";

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

interface SimilarityResults {
    hasInCommon: {[word: string]: number}
    doesNotHaveInCommon: {[word: string]: number}
}

function computeSimilarityTabulation(doc1: SerializedTabulation, doc2: SerializedTabulation): SimilarityResults {
    return {
        hasInCommon: Object.fromEntries(
            Object.entries(doc1.wordCounts)
                .map(([word, count]) => [word, doc2.wordCounts[word]])
                .filter(([word, count]) => !!count)
        ),
        doesNotHaveInCommon: Object.fromEntries(
            Object.entries(doc2.wordCounts)
                .map(([word, count]) => [word, doc1.wordCounts[word]])
                .filter(([ word, count ]) => !count)
                .map(([word]) => [word, doc2.wordCounts[word] ])
        ),
    }
}



describe('Comparing the word frequencies of two documents', () => {
    it('Computes a similarity tabulation between two documents', () => {
        expect(
            computeSimilarityTabulation(
                tabulatedSimplifiedChineseDocuments,
                tabulatedSimplifiedChineseDocuments2
            )
        ).toMatchObject({
            hasInCommon: tabulatedSimplifiedChineseDocuments2.wordCounts,
            doesNotHaveInCommon: {}
        })
        expect(
            computeSimilarityTabulation(
                tabulatedSimplifiedChineseDocuments2,
                tabulatedSimplifiedChineseDocuments
            )
        ).toMatchObject({
            hasInCommon: {
                '天气' : 1,
                '天' : 3,
                '气' : 1
            },
            doesNotHaveInCommon: {
                '今天': 2,
                '今': 2
            }
        })
    })
})