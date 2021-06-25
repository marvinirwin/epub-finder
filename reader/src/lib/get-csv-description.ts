import {SupportedTranslation} from "../../../server/src/shared/supported-translation.service";
import {ICard} from "../../../server/src/shared/ICard";
import {IPositionedWord} from "../../../server/src/shared/Annotation/IPositionedWord";
import {fetchTranslation} from "../services/translate.service";

export async function getCsvDescription({
                                         knownLanguage,
                                         learningToKnowTranslationConfig,
                                         c,
                                         segments
                                     }: {
    knownLanguage: string,
    learningToKnowTranslationConfig: SupportedTranslation | undefined,
    c: ICard,
    segments: IPositionedWord[][]
}) {
    const definition = knownLanguage || (learningToKnowTranslationConfig ?
        await fetchTranslation({from: c.language_code, to: 'en', text: c.learning_language}) :
        '');
    return `Definition: <b>${definition}</b><br/><br/><br/>${segments.map(segment => `<i>${segment}</i>`).join('<br/><br/>')}`;
}