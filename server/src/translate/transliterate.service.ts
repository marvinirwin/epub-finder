import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { TransliterateRequestDto } from './transliterate-request.dto'
import { TransliterateResponseDto } from './transliterate-response.dto'

const endpoint = 'https://api.cognitive.microsofttranslator.com'

export const MAX_TRANSLATE_LENGTH = 10000;
export const transliterate = ({
    text,
    language,
    fromScript,
    toScript,
}: TransliterateRequestDto): Promise<TransliterateResponseDto> => {
    // Add your location, also known as region. The default is global.
    // This is required if using a Cognitive Services resource.
    if (text.length > MAX_TRANSLATE_LENGTH) {
        throw new Error(`Cannot transliterate text over ${MAX_TRANSLATE_LENGTH} characters long`);
    }

    return axios({
        baseURL: endpoint,
        url: '/transliterate',
        method: 'post',
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANSLATOR_KEY1,
            'Ocp-Apim-Subscription-Region': process.env.AZURE_TRANSLATOR_REGION,
            'Content-type': 'application/json',
            'X-ClientTraceId': uuidv4().toString(),
        },
        params: {
            'api-version': '3.0',
            language,
            fromScript,
            toScript,
        },
        data: [
            {
                text,
            },
        ],
        responseType: 'json',
    }).then((response) => {
        return response.data
    })
}
