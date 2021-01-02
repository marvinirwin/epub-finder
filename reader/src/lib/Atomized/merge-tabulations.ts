import {Dictionary} from "lodash";
import {TabulatedDocuments, TabulatedSentences} from "./tabulated-documents.interface";

export function mergeTabulations<T extends TabulatedSentences>(...sentenceInfos: T[]): TabulatedDocuments {
    const aggregateSentenceInfo: TabulatedDocuments = {
        wordElementsMap: {},
        wordSentenceMap: {},
        wordCounts: {},
        segments: {},
        documentWordCounts: {},
        atomMetadatas: new Map()
    };

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
        merge(newSentenceInfo.wordSentenceMap, aggregateSentenceInfo.wordSentenceMap);
        merge(newSentenceInfo.segments, aggregateSentenceInfo.segments)
        // @ts-ignore
        if (newSentenceInfo.documentWordCounts) {
            // @ts-ignore
            merge(newSentenceInfo.documentWordCounts, aggregateSentenceInfo.documentWordCounts)
        }
    }
    return aggregateSentenceInfo;
}