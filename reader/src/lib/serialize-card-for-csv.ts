import { resolveRomanizationConfig } from '../../../server/src/shared/supported-transliteration.service'
import { languageCodesMappedToTranslationConfigs } from '../../../server/src/shared/supported-translation.service'
import { fetchTranslation } from '../services/translate.service'
import { ICard } from '../../../server/src/shared/ICard'
import { fetchTransliteration } from './language/transliterate.service'
import { fetchSynthesizedAudio } from './audio/fetch-synthesized-audio'
import { TextToSpeechConfig } from '../../../server/src/shared/supported-text-to-speech';
import JSZip from 'jszip'

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
        exampleSegments,
        textToSpeechConfig,
        zip
    }: {
        c: ICard,
        exampleSegments: Map<string, Set<string>>,
        textToSpeechConfig: TextToSpeechConfig | undefined,
        zip: JSZip
    }): Promise<CsvCard> => {
    const learningToKnowTranslationConfig = languageCodesMappedToTranslationConfigs.get(c.language_code)
    const learningToKnownTransliterationConfig = resolveRomanizationConfig(c.language_code)
    const [photo] = c.photos;
    const photoSplitByPeriod = photo?.split('.');
    const photoSplitBySlash = photo?.split('/');
    const [knownLanguage] = c.known_language;
    const segments = [...exampleSegments.get(c.learning_language)?.values() || []];
    const wavAudio = textToSpeechConfig && await fetchSynthesizedAudio({ ...textToSpeechConfig, text: c.learning_language });
    const audioFilename = `${c.learning_language}.wav`
    if (wavAudio){
        // Put ${learningLanguage}.wav into the zip file
        await zip.file(audioFilename, wavAudio.blob)
    }
    const ext = photoSplitByPeriod ? photoSplitByPeriod[photoSplitByPeriod.length - 1] : '';
    // I can get the extension from the response headers
    // But then I can't use toDataUrl
    const photoAnkiPath = `${c.learning_language}.${ext}`
    if (photoSplitByPeriod) {
        // Put ${learningLanguage}.${photoExt} into the zip file
        await zip.file(photoAnkiPath, await toDataURL(photo))
    }
    return {
        photo: photo ? `<img src=\\"${photoAnkiPath}\\"/>` : '',
        // What extension does this file have?
        sound: wavAudio ? `<audio controls autoplay src=\\"${audioFilename}\\"/>` : '',
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