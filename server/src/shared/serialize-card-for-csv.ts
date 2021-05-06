import { Card } from '../entities/card.entity'
import { resolveRomanizationConfig } from '../../../reader/src/lib/language/supported-transliteration.service'
import { languageCodeTranslationConfigMap } from '../../../reader/src/lib/language/supported-translation.service'

const toDataURL = url => fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    }))

export const SerializeCardForCsv = async (
    {
        c,
    }: {
    c: Card
}) => {
    const learningToKnowTranslationConfig = languageCodeTranslationConfigMap.get(c.language_code);
    const learningToKnownTransliterationConfig = resolveRomanizationConfig(c.language_code);
    return {
        photo: await toDataURL(c.photos[0]),
        // What extension does this file have?
        sound: await toDataURL(c.sounds[0]),
        description: c.known_language[0],
        romanization: learningToKnowTranslationConfig ? fetchTransliteration(learningToKnownTransliterationConfig) : '',
        learningLanguage: learningToKnowTranslationConfig ? fetchTranslation(learningToKnowTranslationConfig) : '',
    }
}