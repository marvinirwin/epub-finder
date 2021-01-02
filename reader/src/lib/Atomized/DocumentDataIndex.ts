import {Dictionary} from "lodash";
import {DocumentDataIndex} from "./document-data-index.interfaec";

export function mergeSentenceInfo<T extends (DocumentDataIndex)>(...sentenceInfos: T[]): T {
    // @ts-ignore
    const aggregateSentenceInfo: T = {wordElementsMap: {}, wordSentenceMap: {}, wordCounts: {}, sentenceMap: {}, documentWordCounts: {}};

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
        Object.entries(newSentenceInfo.wordCounts).forEach(([key, val]) => {
            if (!aggregateSentenceInfo.wordCounts[key]) {
                aggregateSentenceInfo.wordCounts[key] = 0;
            }
            aggregateSentenceInfo.wordCounts[key] += val
        });
        merge(newSentenceInfo.wordElementsMap, aggregateSentenceInfo.wordElementsMap);
        merge(newSentenceInfo.wordSentenceMap, aggregateSentenceInfo.wordSentenceMap);
        merge(newSentenceInfo.sentenceMap, aggregateSentenceInfo.sentenceMap)
        // @ts-ignore
        if (newSentenceInfo.documentWordCounts) {
            // @ts-ignore
            merge(newSentenceInfo.documentWordCounts, aggregateSentenceInfo.documentWordCounts)
        }
    }
    return aggregateSentenceInfo;
}