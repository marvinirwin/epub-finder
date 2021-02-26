import {Dictionary} from "lodash";
import {TabulatedDocuments} from "./tabulated-documents.interface";

export function mergeDocumentWordCounts(merge: <TabulatedDocuments>
(dict: Dictionary<TabulatedDocuments[]>, aggregateDict: Dictionary<TabulatedDocuments[]>) => void, newSentenceInfo: TabulatedDocuments, aggregateSentenceInfo: TabulatedDocuments) {
    merge(newSentenceInfo.documentWordCounts, aggregateSentenceInfo.documentWordCounts)
}