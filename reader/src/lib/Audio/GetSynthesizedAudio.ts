import {WavAudio} from "../WavAudio";
import axios from "axios";

export async function getSynthesizedAudio(text: string): Promise<WavAudio> {
    const response = await axios.post('/get-speech', {text}, {responseType: 'blob'});
    const buffer = await new Response(response.data as Blob).arrayBuffer()
    return new WavAudio(buffer);
}