import { WordIdentifyingStrategy } from "../tabulation/tabulate-types";
import { segmentBoundaryRegexp, wordBoundaryRegexp } from "../tabulation/word-separator";
import {SegmentSubsequences} from "../index";
import {breakThaiWords} from "../tabulate-documents/tabulate-segment/tabulate";

export interface IPositionedWord {
    word: string;
    position: number;
}
export interface KnowablePositionedWord extends IPositionedWord {
    known: boolean;
    wordCount: number;
}

export interface ReadingProgress {
    label: string;
    subSequences: SegmentSubsequences;
    knownSubSequences: KnowablePositionedWord[];
    unknownSubSequences: KnowablePositionedWord[];
    knownCount: number;
    unknownCount: number;
    uniqueKnownCount: number;
    uniqueUnknownCount: number;
    uniqueKnown: string[];
    uniqueUnknown: string[];
}

// This needs to be moved into reader, because it uses fetch
export const wordCountForSubsequence = async (text: string, strategy: WordIdentifyingStrategy): Promise<number> => {
    switch(strategy) {
        case "noSeparator":
            return text.split("").filter(v => !segmentBoundaryRegexp.test(v)).length;
        case "spaceSeparator":
            return text.split(wordBoundaryRegexp).length;
        case "thai":
            return (await breakThaiWords(text)).length

    }
};