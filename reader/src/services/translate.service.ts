import axios from "axios";

export async function fetchTranslation<A>(learningText: A) {
    const result = await axios.post(`${process.env.PUBLIC_URL}/translate`, {
        from: 'zh-CN',
        to: 'en',
        text: learningText
    })
    return result?.data?.translation || '';
}
