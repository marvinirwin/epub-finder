import {Request, Response} from "express";
import {ImageSearchClient, ImageSearchModels} from "@azure/cognitiveservices-imagesearch";
import {CognitiveServicesCredentials} from "@azure/ms-rest-azure-js";
import {memoWithMySQL} from "./cache";

export const imageSearchEndPoint = process.env["AZURE_IMAGE_SEARCH_ENDPOINT"];
export const imageSearchKey = process.env["AZURE_IMAGE_SEARCH_KEY"] as string;

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

export interface ImageSearchRequest {
    term: string;
}

export const imageSearchFuncF = repo => memoWithMySQL(
    repo,
    "AZURE_IMAGE_SEARCH",
    async function (args: ImageSearchRequest) {
    return sendQuery(args.term);
});
export const imageSearchFunc = (repo) => async (req: Request, res: Response) => {
    // @ts-ignore
    return res.send(JSON.stringify({images: await imageSearchFuncF(repo)(req.body)}));
};
