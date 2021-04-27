import { WordIdentifyingStrategy } from '../tabulation/tabulate'
import { segmentBoundaryRegexp, wordBoundaryRegexp } from '../tabulation/word-separator'

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
    subSequences: IPositionedWord[];
    knownSubSequences: KnowablePositionedWord[];
    unknownSubSequences: KnowablePositionedWord[];
    knownCount: number;
    unknownCount: number;
}

export const wordCountForSubsequence = (text: string, strategy: WordIdentifyingStrategy): number => {
    switch(strategy) {
        case "noSeparator":
            const length = text.split('').filter(v => !segmentBoundaryRegexp.test(v)).length
            return length;
        case "spaceSeparator":
            const length1 = text.split(wordBoundaryRegexp).length
            return length1;

    }
}