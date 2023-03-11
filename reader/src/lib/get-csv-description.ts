import {SupportedTranslation} from "@shared/";
import {ICard} from "@shared/";
import {fetchTranslation, fetchTranslationWithGrammarHints} from "../services/translate.service";
import {SegmentSubsequences} from "@shared/";
import {PositionedWord} from "@shared/";
import {flatten} from "lodash";

function getSegmentTextWithWordsHighlighted(segments: SegmentSubsequences[], targetSubSequences: PositionedWord[]) {
    const textSections: string[] = [];
    segments.forEach(segment => {
        let normalTextStart = 0;
        targetSubSequences.forEach(({position, word}) => {
            const normalText = segment.segmentText.substr(normalTextStart, position);
            const targetTextEnd = position + word.length;
            const redText = segment.segmentText.substr(position, targetTextEnd);
            textSections.push(normalText)
            textSections.push(`<span style="color: red;">${redText}</span>`)
            normalTextStart = targetTextEnd + 1
        })
    })
    return `<i>${textSections.map(section => section).join('<br/><br/>')}</i>`;
}


export async function getCsvDescription(
    {
        knownLanguage,
        learningToKnowTranslationConfig,
        c,
        segments
    }: {
        knownLanguage: string,
        learningToKnowTranslationConfig: SupportedTranslation | undefined,
        c: ICard,
        segments: SegmentSubsequences[]
    }) {
    const definition = knownLanguage || (learningToKnowTranslationConfig ?
        await fetchTranslationWithGrammarHints({from: c.language_code, to: 'en', text: c.learning_language}) :
        '');
    const segmentTextWithWordsHighlighted = getSegmentTextWithWordsHighlighted(
        segments, /* TODO Put the target subsequences here */
        flatten(
            segments.map(
                ({subsequences}) => subsequences
                    .filter(sequence => sequence.word === c.learning_language)
            )
        )
    );
    return `Definition: <b>${definition}</b><br/><br/><br/>${segmentTextWithWordsHighlighted}`;
}