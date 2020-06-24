import {NextFunction, Request, Response} from "express";
import fs from "fs";
import {ImageSearchClient, ImageSearchModels} from "@azure/cognitiveservices-imagesearch";
import {CognitiveServicesCredentials} from "@azure/ms-rest-azure-js";
import Twitter from "twitter-lite";
import {
    AudioConfig,
    SpeechConfig,
    SpeechSynthesizer
} from "microsoft-cognitiveservices-speech-sdk";
import crypto from 'crypto';
import {encode} from 'base64-arraybuffer';

const projectId = "mandarin-trainer";


const {Translate} = require("@google-cloud/translate").v2;

const speechConfig = SpeechConfig.fromSubscription(process.env.AZURE_SPEECH_KEY1, process.env.AZURE_SPEECH_LOCATION);

speechConfig.speechRecognitionLanguage = 'zh-CN'
speechConfig.speechSynthesisLanguage = 'zh-CN'
speechConfig.speechSynthesisVoiceName = ''

interface ISpeechParams {
    text: string;
}


const getTwitter = async () => {
    const twitterKey = process.env["TWITTER_API_KEY"];
    const twitterSecret = process.env["TWITTER_API_KEY_SECRET"];
    const user = new Twitter({
        consumer_key: twitterKey,
        consumer_secret: twitterSecret,
    });
    const response = await user.getBearerToken();
    return new Twitter({
        bearer_token: response.access_token,
        consumer_key: twitterKey,
        consumer_secret: twitterSecret,
    });
};

const twitterInstance = getTwitter();


const imageSearchEndPoint = process.env["AZURE_IMAGE_SEARCH_ENDPOINT"];
const imageSearchKey = process.env["AZURE_IMAGE_SEARCH_KEY"];
const cognitiveServiceCredentials = new CognitiveServicesCredentials(
    imageSearchKey
);

//a helper function to perform an async call to the Bing Image Search API
const sendQuery = async (searchTerm: string) => {
    const client = new ImageSearchClient(cognitiveServiceCredentials, {
        endpoint: imageSearchEndPoint
    });

    const query = searchTerm;
    const options: ImageSearchModels.ImagesSearchOptionalParams = {
        count: 30,
        imageType: "Photo"
    };
    const v = await client.images.search(query, options);
    return v.value;
};

// Instantiates a client
const translate = new Translate({projectId});

interface ITranslationRequest {
    from: string;
    to: string;
    text: string;
}

function memoInFile(filename: string, f: (...a: any[]) => any) {
    let memoFilePath = `${filename}.json`;
    const filedata = fs.existsSync(memoFilePath) && fs.readFileSync(memoFilePath).toString();
    const memo: { [key: string]: any } = JSON.parse(filedata || '{}');
    return async function (...args: any[]) {
        const key = JSON.stringify(args);
        if (!memo[key]) {
            memo[key] = await f(...args);
            await new Promise(resolve => fs.writeFile(memoFilePath, JSON.stringify(memo), resolve));
        }
        return memo[key];
    };
}

const translateFuncF = memoInFile("../TRANSLATIONS", async function (args: ITranslationRequest) {
    const [translation] = await translate.translate(args.text, args.to);
    return {translation};
});

export const translateFunc = async (req: Request, res: Response) => {
    return res.send(JSON.stringify(await translateFuncF(req.body)));
};


interface IImageSearchRequest {
    term: string;
    cb: (str: string) => void;
}

const imageSearchFuncF = memoInFile("../IMAGE_SEARCHES", async function (args: IImageSearchRequest) {
    return sendQuery(args.term);
});
export const imageSearchFunc = async (req: Request, res: Response) => {
    return res.send(JSON.stringify({images: await imageSearchFuncF(req.body)}));
};

interface ILocationsRequest {
    term: string;
    cb: (str: string) => void;
}

const getLocationsF = memoInFile("../TREND_LOCATIONS", async function (args: ILocationsRequest) {
    return await (await twitterInstance).get("trends/available");
});
export const getLocations = async (req: Request, res: Response) => {
    let body = JSON.stringify(await getLocationsF(req.body));
    return res.send(body);
};

interface ITrendRequest {
    id: number;
}

const getTrendForLocationF = memoInFile("../TWITTER_TRENDS", async function (args: ITrendRequest) {
    return await (await twitterInstance).get("trends/place", {id: args.id});
});
export const getTrendForLocation = async (req: Request, res: Response) => {
    return res.send(JSON.stringify(await getTrendForLocationF(req.body)));
};

function loadAudioEndpoint(params: ISpeechParams): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let hash = crypto.createHash('md5').update(JSON.stringify(params)).digest("hex")
        let filename = `${hash}.wav`;
        const audioConfig = AudioConfig.fromAudioFileOutput(filename);
        const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);


        synthesizer.speakSsmlAsync(
            `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="string">
<voice name="zh-CN-YunyangNeural">
    <prosody rate="0.65">
        ${params.text} 
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

const getSpeechSoundf = memoInFile("../SPEECH", async function (args: ISpeechParams) {
    return await loadAudioEndpoint(args)
});
export const getSpeechSound = async (req: Request, res: Response) => {
    return res.send(await getSpeechSoundf(req.body));
};
