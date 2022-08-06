import { flatten } from "lodash";
import { WordIdentifyingStrategy } from "./tabulate";

export type LanguageCode = string

export const chineseCharacterRegexp = /\p{Script_Extensions=Han}/u;
export const latinCharacterRegexp = /[\p{Script=Latin}\u00C0-\u024F\u1E00-\u1EFF]/u;
export const arabicCharacterRegexp = /\p{Script_Extensions=Arabic}/u;
export const assameseBengaliCharacterRegexp = /\p{Script_Extensions=Bengali}/u;
export const bosnianCharacterRegexp = /[\p{Script=Latin}\u0161\u0111\u010D\u0107\u017E]/u;
export const cyrillicRegexp = /\p{Script_Extensions=Cyrillic}/u;
export const gujaratiRegexp = /\p{Script_Extensions=Gujarati}/u;
export const devangariRegexp = /\p{Script_Extensions=Devanagari}/u;

/**
 * https://en.wikipedia.org/wiki/Hebrew_alphabet
 * https://en.wikipedia.org/wiki/Paleo-Hebrew_alphabet
 * https://en.wikipedia.org/wiki/Aramaic_alphabet
 * Oh I think phoenician is out of range \u10900–\u1091F
 * And Imperial Aramaic might be too U+10840–U+1085F
 */
export const hebrewRegexp = /\p{Script_Extensions=Hebrew}/u;
export const greekRegexp = /\p{Script_Extensions=Greek}/u;
export const japaneseRegexp = /[\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script_Extensions=Han}]/u;
export const kannadaRegexp = /\p{Script_Extensions=Kannada}/u;
export const koreanRegexp = /\p{Script_Extensions=Hangul}/u;
export const thaiRegexp = /\p{Script_Extensions=Thai}/u;

// TODO, the rest, i stopped at ko

/**
 * Taken from
 * https://en.wikipedia.org/wiki/English_punctuation#Usage_of_different_punctuation_marks_or_symbols
 * https://en.wikipedia.org/wiki/Chinese_punctuation
 */
export const wordBoundaryRegexp = /[\s.,"'–?:!;，！？；：（）［］【】。「」﹁﹂、‧《》〈〉]/;
export const segmentBoundaryRegexp = /[.,“”"‘’'–?:!;，！？；：（）［］【】。「」﹁﹂、‧《》〈〉]/;
export const LanguageSeparatorStrategy: {
    languages: LanguageCode[];
    strategy?: WordIdentifyingStrategy;
    regexp: RegExp;
}[] = [
    {
        languages: ["zh-Hans", "zh-Hant", "yue"],
        strategy: "noSeparator",
        regexp: chineseCharacterRegexp,
    },
    {
        languages: ["ar", "prs"],
        strategy: "spaceSeparator",
        regexp: arabicCharacterRegexp,
    },
    { languages: ["as", "bn"], regexp: assameseBengaliCharacterRegexp },
    { languages: ["bg", "kk"], regexp: cyrillicRegexp },
    { languages: ["el"], regexp: greekRegexp },
    { languages: ["he"], regexp: hebrewRegexp },
    { languages: ["gu"], regexp: gujaratiRegexp },
    { languages: ["hi"], regexp: devangariRegexp },
    { languages: ["ja"], regexp: japaneseRegexp },
    { languages: ["kn"], regexp: kannadaRegexp },
    { languages: ["ko"], regexp: koreanRegexp },
    { languages: ['th'], regexp: thaiRegexp }
    /**
     * {languages: ['mww']},
     * Hmong Daw has a few scripts, but they're all out of range I think
     */
];

export const languageRegexMap = new Map<
    LanguageCode,
    { strategy?: WordIdentifyingStrategy; regexp: RegExp }
>(
    flatten(
        LanguageSeparatorStrategy.map(({ languages, strategy, regexp }) =>
            languages.map((language) => [language, { strategy, regexp }]),
        ),
    ),
);

export const resolvePartialTabulationConfig = (
    language_code: string,
): {
    isWordBoundaryRegex: RegExp;
    wordIdentifyingStrategy: WordIdentifyingStrategy;
    isNotableCharacterRegex: RegExp;
} => {
    const result = languageRegexMap.get(language_code);
    return {
        wordIdentifyingStrategy: result?.strategy || "spaceSeparator",
        isNotableCharacterRegex: result?.regexp || latinCharacterRegexp,
        isWordBoundaryRegex: wordBoundaryRegexp,
    };
};

