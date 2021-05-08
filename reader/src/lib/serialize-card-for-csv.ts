import { resolveRomanizationConfig } from '../../../server/src/shared/supported-transliteration.service'
import { languageCodesMappedToTranslationConfigs } from '../../../server/src/shared/supported-translation.service'
import { fetchTranslation } from '../services/translate.service'
import { ICard } from '../../../server/src/shared/ICard'
import { fetchTransliteration } from './language/transliterate.service'

const toDataURL = (url: string) => fetch(url)
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
        c: ICard
    }): Promise<CsvCard> => {
    const learningToKnowTranslationConfig = languageCodesMappedToTranslationConfigs.get(c.language_code)
    const learningToKnownTransliterationConfig = resolveRomanizationConfig(c.language_code)
    return {
        photo: await toDataURL(c.photos[0]),
        // What extension does this file have?
        sound: await toDataURL(c.sounds[0]),
        description: c.known_language[0],
        romanization: learningToKnownTransliterationConfig ?
            await fetchTransliteration({
                fromScript: learningToKnownTransliterationConfig.script1,
                toScript: learningToKnownTransliterationConfig.script2,
                language: c.language_code,
                text: c.learning_language }).then(r => r[0]) :
            '',
        learning_language: learningToKnowTranslationConfig ?
            await fetchTranslation({ from: c.language_code, to: 'en', text: c.learning_language }) :
            '',
    }
}