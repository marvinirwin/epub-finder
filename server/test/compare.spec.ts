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
    knownWords: {[word: string]: number}
    unknownWords: {[word: string]: number}
}

function computeSimilarityTabulation(knownDocument: SerializedTabulation, unknownDocument: SerializedTabulation): SimilarityResults {
    return {
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
                .filter(([ word, count ]) => !count)
                .map(([word]) => [word, unknownDocument.wordCounts[word] ])
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