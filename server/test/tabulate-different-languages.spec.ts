import { TabulateService } from '../src/documents/similarity/tabulate.service'
import {
    AtomizedDocument,
    InterpolateService,
    tabulate,
    Segment,
} from '../src/shared'
import { SetWithUniqueLengths } from '../src/shared/tabulate-documents/set-with-unique-lengths'
import {
    languageRegexMap,
    latinCharacterRegexp,
    wordBoundaryRegexp,
} from '../src/shared/tabulation/word-separator'

const segmentText = (text: string, languageCode: string) => {
    return tabulate({
        notableCharacterSequences: new SetWithUniqueLengths([]),
        segments: AtomizedDocument.atomizeDocument(
            InterpolateService.sentences([text]),
        ).segments(),
        greedyWordSet: new SetWithUniqueLengths([]),
        isNotableCharacterRegex:
            languageRegexMap.get(languageCode)?.regexp || latinCharacterRegexp,
        isWordBoundaryRegex: wordBoundaryRegexp,
        wordIdentifyingStrategy:
            languageRegexMap.get(languageCode)?.strategy ||
            'punctuationSeparator',
        languageCode
    })
}

describe('Tabulating different languages', () => {
    it('Tabulates a toki pona sentence', () => {
        expect(!segmentText('Él vive en un gallinero pequeño y normal en un barrio pequeño y normal', 'es').notableSubSequences).toEqual([

        ])
        expect(segmentText('jan.sona toki pona', 'toki').notableSubSequences).toEqual([

        ]);
    })
})
