import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JsonCache } from '../entities/json-cache.entity';
import { sha1 } from "../util/sha1";
import { TranslateWithGrammarExplanationDto } from '../shared';
import { SplitWordsDto } from '../shared';
import debug from "debug";
import {getChatGPTResult} from "../documents/documents.service";
const d = debug("service:language-model");

@Injectable()
export class LanguageModelService {
    private readonly _service = 'languageService';

    constructor(
        @InjectRepository(JsonCache)
        private jsonCacheRepository: Repository<JsonCache>,
    ) {}

    async splitWords(dto: SplitWordsDto) {
        const cacheResult = await this.lookupCacheEntry<SplitWordsDto>(dto);

        if (cacheResult) {
            return cacheResult;
        }

        const result = {
            splitWords: JSON.parse(await getChatGPTResult(`Can you split the following text into words and return the results in a JSON array where every element looks like {"word": "someWord" "position": 0} where position is the position of the start of the word in the original text? ${dto.text} `)),
        };

        this.insertCacheEntry(dto, result);
        return result;
    }

    async translationWithGrammarHints(dto: TranslateWithGrammarExplanationDto) {
        const cacheResult = await this.lookupCacheEntry<TranslateWithGrammarExplanationDto>(dto);

        if (cacheResult) {
            return cacheResult;
        }

        const result = {
            translation: JSON.parse(await getChatGPTResult(`Can you translate the following text into ${dto.destLanguageCode} and explain all grammatical devices in it?  Return the results as JSON structure {"sourceText": string, "translatedText": string, "grammarHints": string[]}. ${dto.text}`)),
        };

        this.insertCacheEntry(dto, result);
        return result;
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
}