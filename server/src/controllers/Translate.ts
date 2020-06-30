import {Request, Response} from "express";
import {memoInJson} from "./my_apis";

const projectId = "mandarin-trainer";

const {Translate} = require("@google-cloud/translate").v2;

export const translate = new Translate({projectId});

export interface TranslationRequest {
    from: string;
    to: string;
    text: string;
}

export const translateFuncF = memoInJson("../TRANSLATIONS", async function (args: TranslationRequest) {
    const [translation] = await translate.translate(args.text, args.to);
    return {translation};
});
export const translateFunc = async (req: Request, res: Response) => {
    return res.send(JSON.stringify(await translateFuncF(req.body)));
};