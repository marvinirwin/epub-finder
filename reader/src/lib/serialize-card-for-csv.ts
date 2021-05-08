import { resolveRomanizationConfig } from '../../../server/src/shared/supported-transliteration.service'
import { languageCodesMappedToTranslationConfigs } from '../../../server/src/shared/supported-translation.service'
import { fetchTranslation } from '../services/translate.service'
import { ICard } from '../../../server/src/shared/ICard'
import { fetchTransliteration } from './language/transliterate.service'
import { uniq } from 'lodash'

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
        exampleSegments
    }: {
        c: ICard,
        exampleSegments: Map<string, Set<string>>
    }): Promise<CsvCard> => {
    const learningToKnowTranslationConfig = languageCodesMappedToTranslationConfigs.get(c.language_code)
    const learningToKnownTransliterationConfig = resolveRomanizationConfig(c.language_code)
    const [photo] = c.photos;
    const [sound] = c.sounds;
    const [knownLanguage] = c.known_language;
    const segments = [...exampleSegments.get(c.learning_language)?.values() || []]
    return {
        photo: photo ? await toDataURL(photo) : '',
        // What extension does this file have?
        sound: sound ? await toDataURL(sound) : '',
        description: `Definition: <b>${knownLanguage || (learningToKnowTranslationConfig ?
            await fetchTranslation({ from: c.language_code, to: 'en', text: c.learning_language }) :
            '')}</b><br/>${segments.join('<br/>')}`,
        romanization: learningToKnownTransliterationConfig ?
            await fetchTransliteration({
                fromScript: learningToKnownTransliterationConfig.script1,
                toScript: learningToKnownTransliterationConfig.script2,
                language: c.language_code,
                text: c.learning_language }) :
            '',
        learning_language: c.learning_language,
    }
}