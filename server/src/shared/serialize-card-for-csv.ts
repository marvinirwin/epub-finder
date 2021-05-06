import { Card } from '../entities/card.entity'
import { resolveRomanizationConfig } from '../../../reader/src/lib/language/supported-transliteration.service'
import { languageCodesMappedToTranslationConfigs } from '../../../reader/src/lib/language/supported-translation.service'
import { transliterate } from '../translate/transliterate.service'
import { fetchTranslation } from '../../../reader/src/services/translate.service'

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
    const learningToKnowTranslationConfig = languageCodesMappedToTranslationConfigs.get(c.language_code)
    const learningToKnownTransliterationConfig = resolveRomanizationConfig(c.language_code)
    return {
        photo: await toDataURL(c.photos[0]),
        // What extension does this file have?
        sound: await toDataURL(c.sounds[0]),
        description: c.known_language[0],
        romanization: learningToKnowTranslationConfig ?
            transliterate({
                fromScript: c.learning_language,
                toScript: learningToKnownTransliterationConfig.script2,
                language: c.learning_language,
                text: c.learning_language }) :
            '',
        learningLanguage: learningToKnowTranslationConfig ?
            fetchTranslation({ from: c.language_code, to: 'en', text: c.learning_language }) :
            '',
    }
}