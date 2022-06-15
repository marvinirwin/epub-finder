import { TransliterateResponseDto, TransliterateRequestDto } from '@shared/'
import axios, { AxiosResponse } from 'axios'
import memoize from 'memoizee'

export const fetchTransliteration = memoize(
    (d: TransliterateRequestDto) => {
        return axios
            .post(`${process.env.PUBLIC_URL}/translate/transliterate`, d)
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
