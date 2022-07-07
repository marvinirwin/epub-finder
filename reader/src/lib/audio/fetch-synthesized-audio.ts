import { WavAudio } from './wav-audio'
import axios from 'axios'
import { TextToSpeechConfig } from "languagetrainer-server/src/shared"
import { SpeechSynthesisRequestDto } from 'languagetrainer-server/src/shared'

export async function fetchSynthesizedAudio(
    c: { text: string} & TextToSpeechConfig
): Promise<WavAudio | undefined> {
    try {
        const response = await axios.post(
            `${process.env.PUBLIC_URL}/api/speech-synthesis`,
             {...c, rate: 1} as SpeechSynthesisRequestDto,
            { responseType: 'blob' },
        )
        const buffer = await new Response(response.data as Blob).arrayBuffer()
        return new WavAudio(buffer)
    } catch (e) {
        console.error(e)
        return undefined
    }
}
