import axios from "axios";
import {memoize} from 'lodash';

export const fetchTranslation = memoize(
    (text: string) =>
        axios.post(`${process.env.PUBLIC_URL}/translate`, {
            from: 'zh-CN',
            to: 'en',
            text: text
        }).then(response => response?.data?.translation || '')
)

