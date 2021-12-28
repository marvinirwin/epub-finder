import {ICard} from "./ICard";
import {SegmentSubsequences} from "./index";
import JSZip from "jszip";
import {languageCodesMappedToTranslationConfigs} from "./supported-translation.service";
import {resolveRomanizationConfig} from "./supported-transliteration.service";

export const SerializeCardForCsv = async (
    {
        c,
        exampleSegments,
        wavAudio,
        zip
    }: {
        c: ICard,
        exampleSegments: Map<string, SegmentSubsequences[]>,
        wavAudio: WavAudio | undefined,
        zip: JSZip
    }): Promise<CsvCard> => {
    const [photoSrc] = c.photos;
    const [knownLanguage] = c.known_language;
    const learningToKnowTranslationConfig = languageCodesMappedToTranslationConfigs.get(c.language_code)
    const learningToKnownTransliterationConfig = resolveRomanizationConfig(c.language_code)
    const segments = [...exampleSegments.get(c.learning_language)?.values() || []];
    /*const wavAudio = textToSpeechConfig && await fetchSynthesizedAudio({
        ...textToSpeechConfig,
        text: c.learning_language
    });*/
    const audioFilename = `${c.learning_language}.wav`
    if (wavAudio) {
        // Put ${learningLanguage}.wav into the zip file
        await zip.file(audioFilename, wavAudio.blob)
    }
    const sound = wavAudio ? `<audio controls autoplay src="${audioFilename}"/>` : '';
    const photo = await resolveImagePath({photo: photoSrc, zip, learning_language: c.learning_language});
    return {
        photo,
        // What extension does this file have?
        sound,
        description: await getCsvDescription({knownLanguage, learningToKnowTranslationConfig, c, segments}),
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