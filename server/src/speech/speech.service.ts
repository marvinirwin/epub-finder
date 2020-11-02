import {Injectable} from '@nestjs/common';
import {AudioConfig, SpeechConfig, SpeechSynthesizer} from "microsoft-cognitiveservices-speech-sdk";
import axios from "axios";
import {sha1} from "../util/sha1";
import {join} from "path";
import fs, {pathExists} from "fs-extra";
import {SpeechSynthesisRequestDto} from "./speech-synthesis-request-dto";

const wavRoot = process.env.SYTHTHESIZED_WAV_CACHE_DIR as string;
const region = process.env.AZURE_SPEECH_LOCATION as string;
const subscriptionKey = process.env.AZURE_SPEECH_KEY1 as string;
const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);

speechConfig.speechRecognitionLanguage = "zh-CN";
speechConfig.speechSynthesisLanguage = "zh-CN";

@Injectable()
export class SpeechService {
    constructor() {
    }

    async speechRecognitionToken() {
        const result = await axios.post(
            `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": subscriptionKey
                }
            }
        );
        return result.data;
    }

    async downloadSynthesizedSpeech(filename: string, ssml1: string) {
        return new Promise<string>((resolve, reject) => {
                const audioConfig = AudioConfig.fromAudioFileOutput(filename);
                const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
                synthesizer.speakSsmlAsync(
                    ssml1,
                    async result => {
                        // TODO Put something here which checks if result is an error
                        console.log(result);
                        resolve();
                        synthesizer.close();
                    },
                    error => {
                        console.log(error);
                        synthesizer.close();
                        reject(error);
                    });
            }
        );
    }

    async TextToSpeech({text, voice, rate}: SpeechSynthesisRequestDto) {
        const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="string">
<voice name="zh-CN-Yaoyao-Apollo">
<prosody rate="0.75">
    ${text} 
</prosody>
</voice>
</speak>`;
        const hash = sha1(ssml);
        const filename = join(wavRoot, `${hash}.wav`);
        const audioFileExists = await fs.pathExists(filename);
        if (!audioFileExists) {
            await this.downloadSynthesizedSpeech(filename, ssml);
        }
        return filename;

    }

    async audioFileExists(speechSynthesisRequestDto: SpeechSynthesisRequestDto) {
        const hash = this.audioFilePath(speechSynthesisRequestDto);
        return pathExists(join(wavRoot, `${hash}.wav`));
    }

    audioFilePath(speechSynthesisRequestDto: SpeechSynthesisRequestDto) {
        return sha1(JSON.stringify(speechSynthesisRequestDto));
    }

}