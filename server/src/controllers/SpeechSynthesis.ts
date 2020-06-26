import crypto from "crypto";
import {AudioConfig, SpeechConfig, SpeechSynthesizer} from "microsoft-cognitiveservices-speech-sdk";
import fs from "fs-extra";
import {encode} from "base64-arraybuffer";
import {ISpeechParams} from "./my_apis";
import express, { Request, Response } from "express";

const speechConfig = SpeechConfig.fromSubscription(process.env.AZURE_SPEECH_KEY1, process.env.AZURE_SPEECH_LOCATION);
speechConfig.speechRecognitionLanguage = 'zh-CN'
speechConfig.speechSynthesisLanguage = 'zh-CN'
const SpeechSynthesisMemoFilePath = "../SPEECH_SYNTHESIS_MEMO.json"

function loadSpeechSynthesisMemo(): {[key: string]: string} {
    const fileData = fs.existsSync(SpeechSynthesisMemoFilePath) && fs.readFileSync(SpeechSynthesisMemoFilePath).toString();
    return JSON.parse(fileData || '{}');
}

const speechSynthesisMemo = loadSpeechSynthesisMemo();

function getMd5(text: any) {
    return crypto.createHash('md5').update(text).digest("hex");
}

function downloadSynthesizedSpeech(filename: string, text: string) {
    return new Promise<string>((resolve, reject) => {
            const audioConfig = AudioConfig.fromAudioFileOutput(filename);
            const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);


            synthesizer.speakSsmlAsync(
                `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="string">
<voice name="zh-CN-YaoyaoNeural">
    <prosody rate="0.65">
        ${text} 
    </prosody>
</voice>
</speak>`,
                async result => {
                    synthesizer.close();
                    // Interact with the audio ArrayBuffer data
                    const bytes = await new Promise<Buffer>((resolve, reject) =>
                        fs.readFile(filename, (err, data) => err ? reject(err) : resolve(data))
                    )
                    resolve(encode(bytes))
                },
                error => {
                    console.log(error);
                    synthesizer.close();
                    reject(error)
                });
        }
    )
}

export async function SynthesizeSpeech(req: Request, res: Response) {
    const {text} = req.body;
    let hash = getMd5(text)
    let filename = `${hash}.wav`;
    if (!speechSynthesisMemo[text]) {
        await downloadSynthesizedSpeech(filename, text);
        speechSynthesisMemo[text] = filename;
        await fs.writeFile(SpeechSynthesisMemoFilePath, JSON.stringify(speechSynthesisMemo));
    }
    res.setHeader("content-type", "audio/wav");
    fs.createReadStream(filename).pipe(res);
}


