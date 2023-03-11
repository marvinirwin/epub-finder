import axios from 'axios'
import memoize from 'memoizee'
import { getApiUrl } from '../lib/util/getApiUrl'
import {SplitWordsDto, SplitWordsResponse, TranslateWithGrammarExplanationResponseDto} from '@shared/*';

export interface TranslateRequest extends TranslateConfig {
    text: string
}

export interface TranslateConfig {
    from: string
    to: string
}

export const fetchTranslation = memoize((t: TranslateRequest) =>
        axios
            .post(getApiUrl("/api/documents/translationsWithGrammarHints"), t)
            .then((response) => (response?.data?.translation as string) || ''),
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
            .post(getApiUrl("/api/documents/translationsWithGrammarHints"), t)
            .then((response) => {
                const translation = response?.data?.translation as TranslateWithGrammarExplanationResponseDto;
                if (translation) {
                    return `
                    ${translation.translatedText}
                    ${translation.grammarHints}
                    `
                }
                return translation || '';
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
            .then((response) => (response?.data?.splitWords as SplitWordsResponse)),
    {
        promise: true,
        normalizer(
            args: Parameters<(d: SplitWordsDto) => Promise<SplitWordsResponse>>,
        ): string {
            return JSON.stringify(args)
        },
    },
)
