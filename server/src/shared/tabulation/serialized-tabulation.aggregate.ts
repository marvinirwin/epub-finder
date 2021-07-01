import {SerializedDocumentTabulation,} from "../tabulate-documents/tabulated-documents.interface";
import {safePushMap} from "../safe-push";
import {SegmentSubsequences} from "../index";
import debug from "debug";

export class SerializedTabulationAggregate {
    serializedTabulations: SerializedDocumentTabulation[]

    constructor(serializedTabulations: SerializedDocumentTabulation[]) {
        this.serializedTabulations = serializedTabulations;
    }

    wordSegmentPositionedWordMap(): Map<string, SegmentSubsequences[]> {
        const m = new Map<string, SegmentSubsequences[]>();
        this.serializedTabulations.forEach((t) =>
            t.wordSegmentSubSequencesMap.forEach((segmentSubsequences, word) =>
                segmentSubsequences.forEach((segmentSubSequence) => {
                        debug("serialized-tabulation-aggregate:segmentSubsequence")(segmentSubSequence);
                        safePushMap(m, word, segmentSubSequence);
                    },
                ),
            ),
        );
        debug("serialized-tabulation-aggregate:serialized-tabulations")(this.serializedTabulations);
        debug("serialized-tabulation-aggregate:wordSegmentPositionedWordMap")(m);
        return m;
    }
}
