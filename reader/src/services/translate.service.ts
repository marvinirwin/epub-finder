import axios from 'axios'
import memoize from 'memoizee'
import { getApiUrl } from '../lib/util/getApiUrl'

export interface TranslateRequest extends TranslateConfig {
    text: string
}

export interface TranslateConfig {
    from: string
    to: string
}

export const fetchTranslation = memoize((t: TranslateRequest) =>
        axios
            .post(getApiUrl("/api/translate"), t)
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
