import {Request, Response} from "express";
import fs from "fs";
import {ImageSearchClient, ImageSearchModels} from "@azure/cognitiveservices-imagesearch";
import {CognitiveServicesCredentials} from "@azure/ms-rest-azure-js";
import Twitter from "twitter-lite";
import {SpeechConfig} from "microsoft-cognitiveservices-speech-sdk";

const projectId = "mandarin-trainer";


const {Translate} = require("@google-cloud/translate").v2;



export interface SpeechParams {
    text: string;
}


const getTwitter = async () => {
    const twitterKey = process.env["TWITTER_API_KEY"];
    const twitterSecret = process.env["TWITTER_API_KEY_SECRET"];
    const user = new Twitter({
        // @ts-ignore
        consumer_key: twitterKey,
        // @ts-ignore
        consumer_secret: twitterSecret,
    });
    const response = await user.getBearerToken();
    return new Twitter({
        // @ts-ignore
        bearer_token: response.access_token,
        // @ts-ignore
        consumer_key: twitterKey,
        // @ts-ignore
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

interface TranslationRequest {
    from: string;
    to: string;
    text: string;
}

function memInJSON(filename: string, f: (...a: any[]) => any) {
    const memoFilePath = `${filename}.json`;
    const filedata = fs.existsSync(memoFilePath) && fs.readFileSync(memoFilePath).toString();
    const memo: { [key: string]: any } = JSON.parse(filedata || "{}");
    return async function (...args: any[]) {
        const key = JSON.stringify(args);
        if (!memo[key]) {
            memo[key] = await f(...args);
            await new Promise(resolve => fs.writeFile(memoFilePath, JSON.stringify(memo), resolve));
        }
        return memo[key];
    };
}


const translateFuncF = memInJSON("../TRANSLATIONS", async function (args: TranslationRequest) {
    const [translation] = await translate.translate(args.text, args.to);
    return {translation};
});

export const translateFunc = async (req: Request, res: Response) => {
    return res.send(JSON.stringify(await translateFuncF(req.body)));
};


interface ImageSearchRequest {
    term: string;
    cb: (str: string) => void;
}

const imageSearchFuncF = memInJSON("../IMAGE_SEARCHES", async function (args: ImageSearchRequest) {
    return sendQuery(args.term);
});
export const imageSearchFunc = async (req: Request, res: Response) => {
    return res.send(JSON.stringify({images: await imageSearchFuncF(req.body)}));
};

interface LocationsRequest {
    term: string;
    cb: (str: string) => void;
}

const getLocationsF = memInJSON("../TREND_LOCATIONS", async function (args: LocationsRequest) {
    return await (await twitterInstance).get("trends/available");
});
export const getLocations = async (req: Request, res: Response) => {
    const body = JSON.stringify(await getLocationsF(req.body));
    return res.send(body);
};

interface TrendRequest {
    id: number;
}

const getTrendForLocationF = memInJSON("../TWITTER_TRENDS", async function (args: TrendRequest) {
    return await (await twitterInstance).get("trends/place", {id: args.id});
});
export const getTrendForLocation = async (req: Request, res: Response) => {
    return res.send(JSON.stringify(await getTrendForLocationF(req.body)));
};

