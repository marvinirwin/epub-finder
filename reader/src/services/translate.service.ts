import axios from 'axios'
import memoize from 'memoizee'
import {getApiUrl} from '../lib/util/getApiUrl'
import {SplitWordsDto, SplitWordsResponseDto, TranslateWithGrammarExplanationResponseDto} from '@shared/*';

export interface TranslateRequest extends TranslateConfig {
    text: string
}

export interface TranslateConfig {
    from: string
    to: string
}

export const fetchTranslation = memoize((t: TranslateRequest) =>
        axios
            .post(getApiUrl("/api/documents/translationWithGrammarHints"), t)
            .then((response) => {
                const data = response.data as TranslateWithGrammarExplanationResponseDto;
                return data.translatedText ? `${data.translatedText}

                ${data.grammarHints.join('\n')}`
                    : '';
            }),
    {
        promise: true,
        normalizer(
            args: Parameters<(d: TranslateRequest) => Promise<string>>,
        ): string {
            return JSON.stringify(args)
        },
    },
)


export const fetchTranslationWithGrammarHints = memoize((t: TranslateRequest) =>
        axios
            .post(getApiUrl("/api/documents/translationWithGrammarHints"), t)
            .then((response) => {
                const translation = response?.data as TranslateWithGrammarExplanationResponseDto;

                function extractTranslation() {
                    if (translation) {
                        return `
                    ${translation.translatedText}

                    ${translation.grammarHints.join('\n')}
                    `
                    }
                    return translation || '';
                }

                return extractTranslation();
            }),
    {
        promise: true,
        normalizer(
            args: Parameters<(d: TranslateRequest) => Promise<TranslateWithGrammarExplanationResponseDto>>,
        ): string {
            return JSON.stringify(args)
        },
    },
)

export const fetchWordSplit = memoize((t: SplitWordsDto) =>
        axios
            .post(getApiUrl("/api/documents/splitWords"), t)
            .then((response) => (response?.data?.splitWords as SplitWordsResponseDto)),
    {
        promise: true,
        normalizer(
            args: Parameters<(d: SplitWordsDto) => Promise<SplitWordsResponseDto>>,
        ): string {
            return JSON.stringify(args)
        },
    },
)
