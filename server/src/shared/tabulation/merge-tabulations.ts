import {Dictionary} from "lodash";
import {TabulatedDocuments, TabulatedSentences} from "./tabulated-documents.interface";

const mergeDocumentWordCounts = (merge: <TabulatedDocuments> (dict: Dictionary<TabulatedDocuments[]>, aggregateDict: Dictionary<TabulatedDocuments[]>) => void, newSentenceInfo: TabulatedDocuments, aggregateSentenceInfo: TabulatedDocuments) => {
    merge(newSentenceInfo.documentWordCounts, aggregateSentenceInfo.documentWordCounts)
};


const safePushMapSet = <T, U>(mapSet: Map<T, Set<U>>, word: T, v: U) => {
        if (!mapSet.get(word)) {
            mapSet.set(word, new Set());
        }
        mapSet.get(word).add(v)
    };

const merge = <T>(dict: Dictionary<T[]>, aggregateDict: Dictionary<T[]>) => {
    for (const key in dict) {
        if (aggregateDict[key]) {
            aggregateDict[key].push(...dict[key]);
        } else {
            aggregateDict[key] = dict[key]
        }
    }
};

export function mergeTabulations<T extends TabulatedSentences>(...sentenceInfos: T[]): TabulatedDocuments {
    const aggregateSentenceInfo: TabulatedDocuments = {
        wordElementsMap: {},
        wordSegmentMap: {},
        wordCounts: {},
        segments: [],
        documentWordCounts: {},
        atomMetadatas: new Map(),
        wordSegmentStringsMap: new Map()
    };


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
        Object.entries(newSentenceInfo.wordSegmentMap)
            .forEach(([word, segments]) =>
                segments.forEach(segment => safePushMapSet(aggregateSentenceInfo.wordSegmentStringsMap, word, segment.translatableText))
            )
        merge(newSentenceInfo.wordElementsMap, aggregateSentenceInfo.wordElementsMap);
        merge(newSentenceInfo.wordSegmentMap, aggregateSentenceInfo.wordSegmentMap);
        aggregateSentenceInfo.segments.push(...newSentenceInfo.segments)
        if (!!(newSentenceInfo as unknown as TabulatedDocuments).documentWordCounts) {
            // @ts-ignore
            mergeDocumentWordCounts(merge, newSentenceInfo, aggregateSentenceInfo);
        }
    }
    return aggregateSentenceInfo;
}