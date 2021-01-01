import {TransliterateResponseDto, TransliterateRequestDto} from "@server/";
import axios, { AxiosResponse } from "axios";
import {memoize} from 'lodash';


export const fetchPinyin = memoize((text: string) => axios.post(
    `${process.env.PUBLIC_URL}/translate/transliterate`,
    {
        language: 'zh-hans',
        text,
        fromScript: 'Hans',
        toScript: 'Latn'
    } as TransliterateRequestDto
).then((response: AxiosResponse<TransliterateResponseDto>) => response?.data?.[0].text || ''))

