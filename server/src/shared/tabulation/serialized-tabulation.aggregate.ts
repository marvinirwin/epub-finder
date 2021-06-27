import {
    SerializedDocumentTabulation,
    SerializedTabulation,
} from '../tabulate-documents/tabulated-documents.interface'
import {safePush, safePushMap, safePushMapSet} from '../safe-push'
import {IPositionedWord} from "../Annotation/IPositionedWord";
import {SegmentSubsequences} from "../index";

export class SerializedTabulationAggregate {
    serializedTabulations: SerializedDocumentTabulation[]

    constructor(serializedTabulations: SerializedDocumentTabulation[]) {
        this.serializedTabulations = serializedTabulations
    }

    wordSegmentPositionedWordMap(): Map<string, SegmentSubsequences[]> {
        const m = new Map<string, SegmentSubsequences[]>();
        this.serializedTabulations.forEach((t) =>
            t.wordSegmentStringsMap.forEach((set, word) =>
                set.forEach((segmentString) =>
                    safePushMap(m, word, segmentString),
                ),
            ),
        );
        return m
    }
}
