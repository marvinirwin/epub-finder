import {chunk} from "lodash";

export interface SupportedTransliteration {
    languageLabel: string;
    code: string;
    script1: string;
    script2: string;
    bidirectional: boolean;
}

export class SupportedTransliterationService {
    // @ts-ignore
    public static SupportedTransliteration: SupportedTransliteration[] = chunk([
        'Arabic', 'ar', 'Arabic Arab', true, 'Latn',
        'Bangla', 'bn', 'Bengali Beng', true, 'Latn',
        'Chinese (Simplified)', 'zh-Hans', 'Hans', true, 'Latn',
        'Chinese (Simplified)', 'zh-Hans', 'Hans', true, 'Chinese Traditional Hant',
        'Chinese (Traditional)', 'zh-Hant', 'Hant', true, 'Latn',
        'Chinese (Traditional)', 'zh-Hant', 'Hant', true, 'Chinese Simplified Hans',
        'Gujarati', 'gu', 'Gujarati Gujr', true, 'Latn',
        'Hebrew', 'he', 'Hebrew Hebr', true, 'Latn',
        'Hindi', 'hi', 'Devanagari Deva', true, 'Latn',
        'Japanese', 'ja', 'Japanese Jpan', true, 'Latn',
        'Kannada', 'kn', 'Kannada Knda', true, 'Latn',
        'Malayalam', 'ml', 'Malayalam Mlym', true, 'Latn',
        'Marathi', 'mr', 'Devanagari Deva', true, 'Latn',
/*
        'Odia', 'or', 'Oriya', 'Orya', true, 'Latn',
*/
        'Punjabi', 'pa', 'Gurmukhi Guru', true, 'Latn',
        'Serbian (Cyrillic)', 'sr-Cyrl', 'Cyrillic Cyrl', false, 'Latn',
        'Serbian (Latin)', 'sr-Latn', 'Latn', false, 'Cyrillic Cyrl',
        'Tamil', 'ta', 'Tamil Taml', true, 'Latn',
        'Telugu', 'te', 'Telugu Telu', true, 'Latn',
        'Thai', 'th', 'Thai Thai', false, 'Latn',
        // @ts-ignore
    ], 5).map(([language, code, script1, bidirectional, script2]: [string, string, string, boolean, string]) => ({
        language,
        code,
        script1,
        script2,
        bidirectional
    }))
}