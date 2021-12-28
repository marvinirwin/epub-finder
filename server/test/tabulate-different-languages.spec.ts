import { TabulateService } from "../src/documents/similarity/tabulate.service";
import {
    AtomizedDocument,
    InterpolateService,
    tabulate,
    Segment,
} from "../src/shared";
import { SetWithUniqueLengths } from "../src/shared/tabulate-documents/set-with-unique-lengths";
import {
    languageRegexMap,
    latinCharacterRegexp,
    wordBoundaryRegexp,
} from "../src/shared/tabulation/word-separator";

const segmentText = (text: string, language_code: string) => {
    const foundRegexForLanguage = languageRegexMap.get(language_code);
    return tabulate({
        notableCharacterSequences: new SetWithUniqueLengths([]),
        segments: AtomizedDocument.atomizeDocument(
            InterpolateService.sentences([text]),
        ).segments(),
        greedyWordSet: new SetWithUniqueLengths([]),
        isNotableCharacterRegex:
            foundRegexForLanguage?.regexp || latinCharacterRegexp,
        isWordBoundaryRegex: wordBoundaryRegexp,
        wordIdentifyingStrategy:
            foundRegexForLanguage?.strategy ||
            "spaceSeparator",
        language_code
    });
};

describe("Tabulating different languages", () => {
    it("Tabulates a Korean sentence", () => {
        expect(segmentText("아기 병아리와 함께하는 겹받침, 쌍받침 연습 동화", "ko")).toEqual([]);
    });
    it("Tabulates a toki pona sentence", () => {
        const segmentText1 = segmentText("Él vive en un gallinero pequeño y normal en un barrio pequeño y normal", "es");
        expect(!segmentText1.notableSubSequences).toEqual([
            {
                "position": 0,
                "word": "Él"
            },
            {
                "position": 3,
                "word": "vive"
            },
            {
                "position": 8,
                "word": "en"
            },
            {
                "position": 11,
                "word": "un"
            },
            {
                "position": 14,
                "word": "gallinero"
            },
            {
                "position": 24,
                "word": "pequeño"
            },
            {
                "position": 32,
                "word": "y"
            },
            {
                "position": 34,
                "word": "normal"
            },
            {
                "position": 41,
                "word": "en"
            },
            {
                "position": 44,
                "word": "un"
            },
            {
                "position": 47,
                "word": "barrio"
            },
            {
                "position": 54,
                "word": "pequeño"
            },
            {
                "position": 62,
                "word": "y"
            },
            {
                "position": 64,
                "word": "normal"
            }
        ]);
        expect(segmentText("jan.sona toki pona", "toki").notableSubSequences).toEqual([

        ]);
    });
});
