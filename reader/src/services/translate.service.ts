import axios from "axios";
import memoize from 'memoizee';

export interface TranslateRequest extends TranslateConfig {
    text: string
}

export interface TranslateConfig {
    from: string;
    to: string
}

export const fetchTranslation = memoize(
    (t: TranslateRequest) =>
        axios.post(`${process.env.PUBLIC_URL}/translate`, t)
            .then(response => response?.data?.translation as string || '')
)

