import {SerializedTabulation} from "./tabulated-documents.interface";
import {flatten} from "@nestjs/common";
import {safePushMapSet} from "../safe-push";

export class SerializedTabulationAggregate {
    serializedTabulations: SerializedTabulation[];

    constructor(serializedTabulations: SerializedTabulation[]) {
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