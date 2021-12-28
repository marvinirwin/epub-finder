import { chunk } from "lodash";
import { languageCodesMappedToLabels } from "./supported-translation.service";

export interface SupportedTransliteration {
    languageLabel: string;
    code: string;
    script1: string;
    script2: string;
    bidirectional: boolean;
}


export const SupportedTransliterations: SupportedTransliteration[] = chunk(
    [
        "Arabic",
        "ar",
        "Arab",
        true,
        "Latn",
        "Bangla",
        "bn",
        "Beng",
        true,
        "Latn",
        "Chinese (Simplified)",
        "zh-Hans",
        "Hans",
        true,
        "Latn",
        "Chinese (Simplified)",
        "zh-Hans",
        "Hans",
        true,
        "Chinese Traditional Hant",
        "Chinese (Traditional)",
        "zh-Hant",
        "Hant",
        true,
        "Latn",
        "Chinese (Traditional)",
        "zh-Hant",
        "Hant",
        true,
        "Chinese Simplified Hans",
        "Gujarati",
        "gu",
        "Gujr",
        true,
        "Latn",
        "Hebrew",
        "he",
        "Hebr",
        true,
        "Latn",
        "Hindi",
        "hi",
        "Deva",
        true,
        "Latn",
        "Japanese",
        "ja",
        "Jpan",
        true,
        "Latn",
        "Kannada",
        "kn",
        "Knda",
        true,
        "Latn",
        "Malayalam",
        "ml",
        "Mlym",
        true,
        "Latn",
        "Marathi",
        "mr",
        "Deva",
        true,
        "Latn",
        /*
    'Odia', 'or', 'Oriya', 'Orya', true, 'Latn',
*/
        "Punjabi",
        "pa",
        "Guru",
        true,
        "Latn",
        "Serbian (Cyrillic)",
        "sr-Cyrl",
        "Cyrl",
        false,
        "Latn",
        "Serbian (Latin)",
        "sr-Latn",
        "Latn",
        false,
        "Cyrl",
        "Tamil",
        "ta",
        "Taml",
        true,
        "Latn",
        "Telugu",
        "te",
        "Telu",
        true,
        "Latn",
        "Thai",
        "th",
        "Thai",
        false,
        "Latn",
    ],
    5,
).map(
    // @ts-ignore
    ([language, code, script1, bidirectional, script2]: [
        string,
        string,
        string,
        boolean,
        string,
    ]) => ({
        language,
        code,
        script1,
        script2,
        bidirectional,
            languageLabel: languageCodesMappedToLabels.get(code) || code
    }),
);


export const resolveRomanizationConfig = (learningLanguageCode: string) => SupportedTransliterations.find(
    ({ script1, script2, bidirectional, code }) => {
        return (
            code.toLowerCase() ===
            learningLanguageCode.toLowerCase() &&
            script2 === "Latn"
        );
    },
);

