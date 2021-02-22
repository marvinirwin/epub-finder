import {TransliterateResponseDto, TransliterateRequestDto} from "@server/";
import axios, { AxiosResponse } from "axios";
import memoize from 'memoizee';


export const transliterate = memoize((d: TransliterateRequestDto) => axios.post(
    `${process.env.PUBLIC_URL}/translate/transliterate`,
    d
).then((response: AxiosResponse<TransliterateResponseDto>) => response?.data?.[0].text || ''))

