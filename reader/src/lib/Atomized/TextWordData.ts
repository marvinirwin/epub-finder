import {Dictionary} from "lodash";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {AtomizedSentence} from "./AtomizedSentence";

export interface TextWordData {
    wordElementsMap: Dictionary<IAnnotatedCharacter[]>;
    wordCounts: Dictionary<number>;
    wordSentenceMap: Dictionary<AtomizedSentence[]>;
    sentenceMap: Dictionary<AtomizedSentence[]>;
}

export function mergeSentenceInfo(...sentenceInfos: TextWordData[]): TextWordData {
    let aggregateSentenceInfo = sentenceInfos[0];

    function merge<T>(dict: Dictionary<T[]>, aggregateDict: Dictionary<T[]>) {
        for (let key in dict) {
            if (aggregateDict[key]) {
                aggregateDict[key].push(...dict[key]);
            } else {
                aggregateDict[key] = dict[key]
            }
        }
    }

    for (let i = 1; i < sentenceInfos.length; i++) {
        const newSentenceInfo = sentenceInfos[i];
        Object.entries(newSentenceInfo.wordCounts).forEach(([key, val]) => {
            if (!aggregateSentenceInfo .wordCounts[key]) {
                aggregateSentenceInfo .wordCounts[key] = 0;
            }
            aggregateSentenceInfo.wordCounts[key] += val
        });

        merge(newSentenceInfo.wordElementsMap, aggregateSentenceInfo.wordElementsMap);
/*
        for (let key in newSentenceInfo.wordElementsMap) {
            if (aggregateSentenceInfo.wordElementsMap[key]) {
                aggregateSentenceInfo.wordElementsMap[key].push(...newSentenceInfo.wordElementsMap[key]);
            } else {
                aggregateSentenceInfo.wordElementsMap[key] = newSentenceInfo.wordElementsMap[key]
            }
        }
*/

        merge(newSentenceInfo.wordSentenceMap, aggregateSentenceInfo.wordSentenceMap);
        merge(newSentenceInfo.sentenceMap, aggregateSentenceInfo.sentenceMap)
    }
    return aggregateSentenceInfo;
}