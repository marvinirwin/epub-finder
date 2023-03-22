import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JsonCache } from '../entities/json-cache.entity';
import { sha1 } from "../util/sha1";
import {
    SplitWordsResponseDto,
    TranslateWithGrammarExplanationDto,
    TranslateWithGrammarExplanationResponseDto
} from '../shared';
import { SplitWordsDto } from '../shared';
import debug from "debug";
import {getChatGPTResult} from "../documents/documents.service";
const d = debug("service:language-model");

@Injectable()
export class LanguageModelService {
    private readonly _languageModelSplitWords = 'languageModelSplitWords';
    private readonly _translationWithGrammarHints = 'translationWithGrammarHints';


    constructor(
        @InjectRepository(JsonCache)
        private jsonCacheRepository: Repository<JsonCache>,
    ) {}

    async splitWords(dto: SplitWordsDto): Promise<SplitWordsResponseDto> {
        const cacheResult = await this.lookupCacheEntry<SplitWordsResponseDto>(dto, this._languageModelSplitWords);

        if (cacheResult) {
            return cacheResult;
        }

        const result = {
            splitWords: JSON.parse(await getChatGPTResult(`Can you split the following text into words and return the results in a JSON array where every element looks like {"word": "someWord" "position": 0} where position is the position of the start of the word in the original text? ${dto.text} `)),
        } as SplitWordsResponseDto;

        this.insertCacheEntry(dto, result);
        return result;
    }

    async translationWithGrammarHints(dto: TranslateWithGrammarExplanationDto): Promise<TranslateWithGrammarExplanationResponseDto>  {
        const cacheResult = await this.lookupCacheEntry<TranslateWithGrammarExplanationResponseDto>(dto, this._translationWithGrammarHints);

        if (cacheResult) {
            return cacheResult;
        }

        const result = JSON.parse(await getChatGPTResult(`Can you translate the following text into ${dto.destLanguageCode} and explain all grammatical devices in it?  Return the results as JSON structure {"sourceText": string, "translatedText": string, "grammarHints": string[]}. ${dto.text}`));

        this.insertCacheEntry(dto, result);
        return result;
    }

    insertCacheEntry(translateRequestDto: any, translateResponseDto: any, service?: string) {
        const cacheEntry: Partial<JsonCache> = {
            service: service,
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
        cacheEntryService: string
    ): Promise<T | undefined> {
        const conditions: Partial<JsonCache> = {
            service: cacheEntryService,
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