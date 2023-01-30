import { Injectable } from "@nestjs/common";
import { TranslateRequestDto } from "./translate-request-dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JsonCache } from "../entities/json-cache.entity";
import { sha1 } from "../util/sha1";

const { Translate } = require("@google-cloud/translate").v2;
export const projectId = "mandarin-trainer";
export const translate = new Translate({ projectId, key: process.env.GOOGLE_API_KEY });

import debug from "debug";
import { MAX_TRANSLATE_LENGTH } from "./transliterate.service";
const d = debug("service:translate");

@Injectable()
export class TranslateService {
    constructor(
        @InjectRepository(JsonCache)
        private jsonCacheRepository: Repository<JsonCache>,
    ) {}

    async translate({ text, to }: TranslateRequestDto) {
        if (text.length > MAX_TRANSLATE_LENGTH) {
            throw new Error(`Cannot translate over ${MAX_TRANSLATE_LENGTH} characters at once`);
        }
        const [translation] = await translate.translate(text, to);
        return { translation };
    }
    async transliterate({ text, to }: TranslateRequestDto) {
        const [translation] = await translate.translate(text, to);
        return { translation };
    }

    private readonly _service = "GOOGLE_TRANSLATIONS"

    async lookupCacheEntry<T>(
        translateRequestDto: any,
    ): Promise<T | undefined> {
        const conditions: Partial<JsonCache> = {
            service: this._service,
            key_hash: sha1([translateRequestDto]),
        };
        d(conditions);
        const cacheEntry = await this.jsonCacheRepository.findOne(conditions);
        if (cacheEntry) {
            // Kind of inefficient, since it will probably be stringified again
            return JSON.parse(cacheEntry.value);
        }
    }

    insertCacheEntry(translateRequestDto: any, translateResponseDto: any) {
        const cacheEntry: Partial<JsonCache> = {
            service: this._service,
            key_hash: sha1([translateRequestDto]),
            key: JSON.stringify([translateRequestDto]),
            value: JSON.stringify(translateResponseDto),
        };
        d(cacheEntry);
        this.jsonCacheRepository.save(
            Object.assign(new JsonCache(), cacheEntry),
        );
    }
}
