import {WavAudio} from "../WavAudio";
import axios from "axios";

export async function fetchSynthesizedAudio(text: string): Promise<WavAudio | undefined> {
    try {
        const response = await axios.post(`${process.env.PUBLIC_URL}/get-speech`, {text}, {responseType: 'blob'});
        const buffer = await new Response(response.data as Blob).arrayBuffer()
        return new WavAudio(buffer);
    } catch(e) {
        console.error(e);
        return undefined;
    }
}