import {Segment} from "../src/shared";

export const test = 1;
describe('document tabulation', () => {
    it(
        'tabulates Simplified Chinese documents using an average word list',
        () => {
            expect(Segment.tabulate(simplifiedChineseWords, chineseBasicTabulationDocument))
                .toMatchObject(chineseBasicTabulationResults)
        }
    )
})