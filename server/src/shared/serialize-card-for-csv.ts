import { Card } from '../entities/card.entity'
import { resolveRomanizationConfig } from '../../../reader/src/lib/language/supported-transliteration.service'
import { languageCodesMappedToTranslationConfigs } from '../../../reader/src/lib/language/supported-translation.service'
import { transliterate } from '../translate/transliterate.service'
import { fetchTranslation } from '../../../reader/src/services/translate.service'

const toDataURL = url => fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        // TODO figure out if this will ever be an arrayBuffer
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    }))

export type CsvCard = {
    photo: string,
    sound: string,
    description: string,
    romanization: string,
    learning_language: string
}
export const SerializeCardForCsv = async (
    {
        c,
    }: {
        c: Card
    }): Promise<CsvCard> => {
    const learningToKnowTranslationConfig = languageCodesMappedToTranslationConfigs.get(c.language_code)
    const learningToKnownTransliterationConfig = resolveRomanizationConfig(c.language_code)
    return {
        photo: await toDataURL(c.photos[0]),
        // What extension does this file have?
        sound: await toDataURL(c.sounds[0]),
        description: c.known_language[0],
        romanization: learningToKnowTranslationConfig ?
            await transliterate({
                fromScript: c.learning_language,
                toScript: learningToKnownTransliterationConfig.script2,
                language: c.learning_language,
                text: c.learning_language }).then(r => r[0].text) :
            '',
        learning_language: learningToKnowTranslationConfig ?
            await fetchTranslation({ from: c.language_code, to: 'en', text: c.learning_language }) :
            '',
    }
}