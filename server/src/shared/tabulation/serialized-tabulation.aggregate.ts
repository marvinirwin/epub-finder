import {SerializedDocumentTabulation, SerializedTabulation} from "../tabulate-documents/tabulated-documents.interface";
import {safePushMapSet} from "../safe-push";

export class SerializedTabulationAggregate {
    serializedTabulations: SerializedDocumentTabulation[];

    constructor(serializedTabulations: SerializedDocumentTabulation[]) {
        debugger;
        this.serializedTabulations = serializedTabulations;
    }

    wordSegmentStringsMap(): Map<string, Set<string>> {
        const m = new Map<string, Set<string>>();
        this.serializedTabulations
            .forEach(t => t.wordSegmentStringsMap.forEach((set, word) => set.forEach(segmentString =>
                safePushMapSet(m, word, segmentString)))
            )
        return m
    }

}