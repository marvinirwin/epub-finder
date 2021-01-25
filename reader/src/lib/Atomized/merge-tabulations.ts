import {Dictionary} from "lodash";
import {TabulatedDocuments, TabulatedSentences} from "./tabulated-documents.interface";

const isDocumentTabulation = (t: any): t is TabulatedDocuments => {
    return !!(t as TabulatedDocuments).documentWordCounts;
}


function mergeDocumentWordCounts(merge: <TabulatedDocuments>
(dict: Dictionary<TabulatedDocuments[]>, aggregateDict: Dictionary<TabulatedDocuments[]>) => void, newSentenceInfo: TabulatedDocuments, aggregateSentenceInfo: TabulatedDocuments) {
    merge(newSentenceInfo.documentWordCounts, aggregateSentenceInfo.documentWordCounts)
}

export function mergeTabulations<T extends TabulatedSentences>(...sentenceInfos: T[]): TabulatedDocuments {
    const aggregateSentenceInfo: TabulatedDocuments = {
        wordElementsMap: {},
        wordSegmentMap: {},
        wordCounts: {},
        segments: [],
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
        merge(newSentenceInfo.wordSegmentMap, aggregateSentenceInfo.wordSegmentMap);
        aggregateSentenceInfo.segments.push(...newSentenceInfo.segments)
        if (isDocumentTabulation(newSentenceInfo)) {
            mergeDocumentWordCounts(merge, newSentenceInfo, aggregateSentenceInfo);
        }
    }
    return aggregateSentenceInfo;
}