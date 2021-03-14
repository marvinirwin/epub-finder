import {mergeDocumentWordCounts, TabulatedDocuments, TabulatedSegments} from "@shared/";
import {Dictionary} from "lodash";
import {safePushMap} from "@shared/";
import {tabulationFactory} from "../../../server/src/shared/tabulation/tabulate";

export const mergeTabulations = <T extends TabulatedSegments>(...sentenceInfos: T[]): TabulatedDocuments => {
    const aggregateSentenceInfo: TabulatedDocuments = tabulationFactory();

    function merge<T>(dict: Dictionary<T[]>, aggregateDict: Dictionary<T[]>) {
        for (const key in dict) {
            if (aggregateDict[key]) {
                aggregateDict[key].push(...dict[key]);
            } else {
                aggregateDict[key] = dict[key]
            }
        }
    }

    for (let i = 0; i < sentenceInfos.length; i++) {
        const newSentenceInfo = sentenceInfos[i];
        newSentenceInfo.greedyWordCounts.forEach((count, word) => {
            if (!aggregateSentenceInfo.greedyWordCounts.get(word)) {
                aggregateSentenceInfo.greedyWordCounts.set(word, 0);
            }
            aggregateSentenceInfo.greedyWordCounts.set(
                word,
                aggregateSentenceInfo.greedyWordCounts.get(word) as number + 1
            )
        })
        newSentenceInfo.atomMetadatas.forEach(
            (value, key) =>
                aggregateSentenceInfo.atomMetadatas.set(key, value)
        )
        Object.entries(newSentenceInfo.wordCounts).forEach(([key, val]) => {
            if (!aggregateSentenceInfo.wordCounts[key]) {
                aggregateSentenceInfo.wordCounts[key] = 0;
            }
            aggregateSentenceInfo.wordCounts[key] += val
        });
        merge(newSentenceInfo.wordElementsMap, aggregateSentenceInfo.wordElementsMap);
        merge(newSentenceInfo.wordSegmentMap, aggregateSentenceInfo.wordSegmentMap);
        aggregateSentenceInfo.segments.push(...newSentenceInfo.segments)

        if (!!(newSentenceInfo as unknown as TabulatedDocuments).documentWordCounts) {
            // @ts-ignore
            mergeDocumentWordCounts(merge, newSentenceInfo, aggregateSentenceInfo);
            (newSentenceInfo as unknown as TabulatedDocuments).greedyDocumentWordCounts.forEach((documentWordCounts, word) => {
                documentWordCounts.forEach(documentWordCount => {
                    safePushMap(aggregateSentenceInfo.greedyDocumentWordCounts, word, documentWordCount)
                })
            })
        }
    }
    return aggregateSentenceInfo;
};