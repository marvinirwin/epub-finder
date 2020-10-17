import crypto from "crypto";
import {AudioConfig, SpeechConfig, SpeechSynthesizer, SpeechRecognizer} from "microsoft-cognitiveservices-speech-sdk";
import fs from "fs-extra";
import {Request, Response} from "express";
import axios from "axios";
import {join} from "path";
import {getSha1} from "../util/sha1";

const region = process.env.AZURE_SPEECH_LOCATION as string;
const subscriptionKey = process.env.AZURE_SPEECH_KEY1 as string;
const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);

speechConfig.speechRecognitionLanguage = "zh-CN";
speechConfig.speechSynthesisLanguage = "zh-CN";

function downloadSynthesizedSpeech(filename: string, ssml1: string) {
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

const wavRoot = process.env.SYTHTHESIZED_WAV_CACHE_DIR as string;

export async function TextToSpeech(req: Request, res: Response) {
    // @ts-ignore
    const {text} = req.body;
    const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="string">
<voice name="zh-CN-Yaoyao-Apollo">
<prosody rate="0.75">
    ${text} 
</prosody>
</voice>
</speak>`;
    const hash = getSha1(ssml);
    const filename = join(wavRoot, `${hash}.wav`);
    const audioFileExists = await fs.pathExists(filename);
    if (!audioFileExists) {
        await downloadSynthesizedSpeech(filename, ssml);
    }
    // @ts-ignore
    res.setHeader("content-type", "audio/wav");
    // @ts-ignore
    fs.createReadStream(filename).pipe(res);
}

export async function GetSpeechRecognitionToken(req: Request, res: Response) {
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
    // @ts-ignore
    res.send(result.data);
}

export interface SpeechSynthesisParams {
    text: string;
}