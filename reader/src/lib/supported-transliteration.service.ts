import {chunk} from "lodash";

export interface SupportedTransliteration {
    languageLabel: string;
    languageCode: string;
    script1: string;
    script2: string;
    bidirectional: boolean;
}

export class SupportedTransliterationService {
    // @ts-ignore
    public static SupportedTransliteration: SupportedTransliteration[] = chunk([
        'Arabic', 'ar', 'Arabic Arab', true, 'Latin Latn',
        'Bangla', 'bn', 'Bengali Beng', true, 'Latin Latn',
        'Chinese (Simplified)', 'zh-Hans', 'Chinese Simplified Hans', true, 'Latin Latn',
        'Chinese (Simplified)', 'zh-Hans', 'Chinese Simplified Hans', true, 'Chinese Traditional Hant',
        'Chinese (Traditional)', 'zh-Hant', 'Chinese Traditional Hant', true, 'Latin Latn',
        'Chinese (Traditional)', 'zh-Hant', 'Chinese Traditional Hant', true, 'Chinese Simplified Hans',
        'Gujarati', 'gu', 'Gujarati Gujr', true, 'Latin Latn',
        'Hebrew', 'he', 'Hebrew Hebr', true, 'Latin Latn',
        'Hindi', 'hi', 'Devanagari Deva', true, 'Latin Latn',
        'Japanese', 'ja', 'Japanese Jpan', true, 'Latin Latn',
        'Kannada', 'kn', 'Kannada Knda', true, 'Latin Latn',
        'Malayalam', 'ml', 'Malayalam Mlym', true, 'Latin Latn',
        'Marathi', 'mr', 'Devanagari Deva', true, 'Latin Latn',
        'Odia', 'or', 'Oriya', 'Orya', true, 'Latin Latn',
        'Punjabi', 'pa', 'Gurmukhi Guru', true, 'Latin Latn',
        'Serbian (Cyrillic)', 'sr-Cyrl', 'Cyrillic Cyrl', false, 'Latin Latn',
        'Serbian (Latin)', 'sr-Latn', 'Latin Latn', false, 'Cyrillic Cyrl',
        'Tamil', 'ta', 'Tamil Taml', true, 'Latin Latn',
        'Telugu', 'te', 'Telugu Telu', true, 'Latin Latn',
        'Thai', 'th', 'Thai Thai', false, 'Latin Latn',
        // @ts-ignore
    ], 5).map(([language, code, script1, bidirectional, script2]: [string, string, string, boolean, string]) => ({
        language,
        code,
        script1,
        script2,
        bidirectional
    }))
}