import {Request, Response} from "express";
import {memoWithMySQL} from "./cache";
import {JsonCache} from "../entities/JsonCache";
import {Repository} from "typeorm";
import {UsageEvent} from "../entities/UsageEvent";

const projectId = "mandarin-trainer";

const {Translate} = require("@google-cloud/translate").v2;

export const translate = new Translate({projectId});

export interface TranslationRequest {
    from: string;
    to: string;
    text: string;
}

export const translateFuncF = repo =>
    memoWithMySQL(
        repo,
        "GOOGLE_TRANSLATIONS",
        async function (args: TranslationRequest) {
            const [translation] = await translate.translate(args.text, args.to);
            return {translation};
        }
    );
const TRANSLATE_COST = 500;
const BODY_LIMIT = 500;
export const translateFunc = (cacheRepo: Repository<JsonCache>, costRepo: Repository<UsageEvent>) => async (req: Request, res: Response) => {
    // @ts-ignore
    let stringBody = JSON.stringify(req.body);
    if (stringBody.length > BODY_LIMIT) {
        // @ts-ignore
        res.status(400).send({msg: "Body too long"})
        return;
    }
    // @ts-ignore
    if (req.user) {
        // Increment cost
        const c = new UsageEvent();
        c.cost = TRANSLATE_COST;
        // @ts-ignore
        c.userId = req.user.id;
        // @ts-ignore
        c.description = req.body;
        c.label = 'translate';
        c.cost = TRANSLATE_COST;
        await costRepo.save(c);
    }

    // @ts-ignore
    return res.send( JSON.stringify(await translateFuncF(cacheRepo)(req.body)) );
};
