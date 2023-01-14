import { TransliterateResponseDto, TransliterateRequestDto } from '@shared/'
import axios, { AxiosResponse } from 'axios'
import memoize from 'memoizee'
import {getApiUrl} from '../util/getApiUrl'

export const fetchTransliteration = memoize(
    (d: TransliterateRequestDto) => {
        return axios
            .post(getApiUrl("/api/translate/transliterate"), d)
            .then(
                (response: AxiosResponse<TransliterateResponseDto>) =>
                    response?.data?.[0].text || '',
            )
    },
    {
        promise: true,
        normalizer(
            args: Parameters<(d: TransliterateRequestDto) => Promise<string>>,
        ): string {
            return JSON.stringify(args)
        },
    },
)
