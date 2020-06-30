import crypto from "crypto";
import {AudioConfig, SpeechConfig, SpeechSynthesizer, SpeechRecognizer} from "microsoft-cognitiveservices-speech-sdk";
import fs from "fs-extra";
import {Request, Response} from "express";
import axios from "axios";

// TODO is AZURE_SPEECH_LOCATION the region?  They're both location oriented words
const region = process.env.AZURE_SPEECH_LOCATION;
const subscriptionKey = process.env.AZURE_SPEECH_KEY1;
const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);

speechConfig.speechRecognitionLanguage = "zh-CN";
speechConfig.speechSynthesisLanguage = "zh-CN";

const SpeechSynthesisMemoFilePath = "../SPEECH_SYNTHESIS_MEMO.json";

function loadSpeechSynthesisMemo(): { [key: string]: string } {
    const fileData = fs.existsSync(SpeechSynthesisMemoFilePath) && fs.readFileSync(SpeechSynthesisMemoFilePath).toString();
    return JSON.parse(fileData || "{}");
}

const speechSynthesisMemo = loadSpeechSynthesisMemo();

function getMd5(text: any) {
    return crypto.createHash("md5").update(text).digest("hex");
}

function downloadSynthesizedSpeech(filename: string, text: string) {
    return new Promise<string>((resolve, reject) => {
            const audioConfig = AudioConfig.fromAudioFileOutput(filename);
            const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
            synthesizer.speakSsmlAsync(
                `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="string">
<voice name="zh-CN-Yaoyao-Apollo">
    <prosody rate="0.65">
        ${text} 
    </prosody>
</voice>
</speak>`,
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

export async function TextToSpeech(req: Request, res: Response) {
    const {text} = req.body;
    const hash = getMd5(text);
    const filename = `${hash}.wav`;
    if (!speechSynthesisMemo[text]) {
        await downloadSynthesizedSpeech(filename, text);
        speechSynthesisMemo[text] = filename;
        await fs.writeFile(SpeechSynthesisMemoFilePath, JSON.stringify(speechSynthesisMemo));
    }
    res.setHeader("content-type", "audio/wav");
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
    debugger;
    res.send(result.data);
}

export interface SpeechSynthesisParams {
    text: string;
}