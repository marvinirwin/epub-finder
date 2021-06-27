import { WordIdentifyingStrategy } from '../tabulation/tabulate'
import { segmentBoundaryRegexp, wordBoundaryRegexp } from '../tabulation/word-separator'
import {SegmentSubsequences} from "../index";

export interface IPositionedWord {
    word: string
    position: number
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
    uniqueKnownCount: number
    uniqueUnknownCount: number
    uniqueKnown: string[]
    uniqueUnknown: string[]
}

export const wordCountForSubsequence = (text: string, strategy: WordIdentifyingStrategy): number => {
    switch(strategy) {
        case "noSeparator":
            return text.split('').filter(v => !segmentBoundaryRegexp.test(v)).length;
        case "spaceSeparator":
            return text.split(wordBoundaryRegexp).length;

    }
}