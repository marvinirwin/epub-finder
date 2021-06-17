import {resolveRomanizationConfig} from '../../../server/src/shared/supported-transliteration.service'
import {languageCodesMappedToTranslationConfigs} from '../../../server/src/shared/supported-translation.service'
import {fetchTranslation} from '../services/translate.service'
import {ICard} from '../../../server/src/shared/ICard'
import {fetchTransliteration} from './language/transliterate.service'
import {fetchSynthesizedAudio} from './audio/fetch-synthesized-audio'
import {TextToSpeechConfig} from '../../../server/src/shared/supported-text-to-speech';
import JSZip from 'jszip'

function resolveExtFromResponseHeaders(response: Response): string | undefined {
    const map: { [key: string]: string } = {
        'image/jpeg': 'jpeg',
        'image/png': 'png',
        'image/gif': 'gif',
    };
    return map[response.headers.get('content-type') as string] || undefined;
}

const toDataURL = (url: string) => fetch(url)
    .then(response => ({blob: response.blob(), ext: resolveExtFromResponseHeaders(response)}))
    .then(({blob, ext}) => new Promise<{ ext: string | undefined, dataUrl: string, blob: Promise<Blob> }>(async (resolve, reject) => {
        const reader = new FileReader()
        // TODO figure out if this will ever be an arrayBuffer
        reader.onloadend = () => resolve({dataUrl: reader.result as string, blob, ext})
        reader.onerror = reject
        reader.readAsDataURL(await blob);
    }))

export type CsvCard = {
    photo: string,
    sound: string,
    description: string,
    romanization: string,
    learning_language: string
}

async function resolveImagePath({
                                    photo,
                                    zip,
                                    learning_language
                                }: { photo: string | undefined, zip: JSZip, learning_language: string }) {
    if (!photo) {
        return "";
    }
    // I can get the extension from the response headers
    // But then I can't use toDataUrl
    const {ext, /*dataUrl,*/ blob} = await toDataURL(photo);
    const photoAnkiPath = `${learning_language}.${ext}`
    await zip.file(photoAnkiPath, await blob);
    return `<img src=\\"${photoAnkiPath}\\"/>`
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
    const [photo] = c.photos;
    const [knownLanguage] = c.known_language;
    const learningToKnowTranslationConfig = languageCodesMappedToTranslationConfigs.get(c.language_code)
    const learningToKnownTransliterationConfig = resolveRomanizationConfig(c.language_code)
    const segments = [...exampleSegments.get(c.learning_language)?.values() || []];
    const wavAudio = textToSpeechConfig && await fetchSynthesizedAudio({
        ...textToSpeechConfig,
        text: c.learning_language
    });
    const audioFilename = `${c.learning_language}.wav`
    if (wavAudio) {
        // Put ${learningLanguage}.wav into the zip file
        await zip.file(audioFilename, wavAudio.blob)
    }
    return {
        photo: (await resolveImagePath({photo, zip, learning_language: c.learning_language})),
        // What extension does this file have?
        sound: wavAudio ? `<audio controls autoplay src=\\"${audioFilename}\\"/>` : '',
        description: `Definition: <b>${knownLanguage || (learningToKnowTranslationConfig ?
            await fetchTranslation({from: c.language_code, to: 'en', text: c.learning_language}) :
            '')}</b><br/>${segments.join('<br/>')}`,
        romanization: learningToKnownTransliterationConfig ?
            await fetchTransliteration({
                fromScript: learningToKnownTransliterationConfig.script1,
                toScript: learningToKnownTransliterationConfig.script2,
                language: c.language_code,
                text: c.learning_language
            }) :
            '',
        learning_language: c.learning_language,

    }
}