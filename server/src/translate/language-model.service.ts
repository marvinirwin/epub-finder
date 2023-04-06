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

export const JsonTypescriptPromptStart = `You will function as a JSON api. The user will feed you valid JSON and you will return valid JSON, do not add any extra characters to the output that would make your output invalid JSON.

The end of this system message will contain typescript types named Input and Output. 
`;
export const JsonTypescriptPromptInputTypeStart = `The input to this is defined as follows`;
export const JsonTypescriptPromptOutputTypeStart = `Your output, which should be `;
export const JsonTypescriptPromptEnd = `Please only reply the following prompt with the JSON representation of the APIResult interface, parsable with JSON.parse`;

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

        const splitWords = await getChatGPTResult(`Can you split the following text into words and return the results in a JSON array where every element looks like {"word": "someWord" "position": 0} where position is the position of the start of the word in the original text? ${dto.text} `);
        let result;
        try {
            result = {
                splitWords: JSON.parse(splitWords),
            } as SplitWordsResponseDto;
        } catch(e) {
            console.error(`Failed to parse splitWords response for ${splitWords}`)
            result = {
                splitWords: []
            }
        }
        this.insertCacheEntry(dto, result, this._languageModelSplitWords);
        return result;

    }

    async translationWithGrammarHints(dto: TranslateWithGrammarExplanationDto): Promise<TranslateWithGrammarExplanationResponseDto>  {
        const cacheResult = await this.lookupCacheEntry<TranslateWithGrammarExplanationResponseDto>(dto, this._translationWithGrammarHints);

        if (cacheResult) {
            return cacheResult;
        }
        let response = await getChatGPTResult(`
        
${JsonTypescriptPromptStart}

If all inputs are valid then you should perform the action described in the "command" value of the input and return the result in the format described by the Output type.  All new files should be created relative to the baseDir

${JsonTypescriptPromptInputTypeStart}
export interface Input {
    text: string;
    command: string
}

${JsonTypescriptPromptOutputTypeStart}

interface Output {
    sourceText: string
    translatedText: string;
    grammarHints: string[]
}

${JsonTypescriptPromptEnd}

${JSON.stringify({
            command: `Translate the following text into ${dto.destLanguageCode} and explain all grammatical clauses and concepts`, 
            text: dto.text,
})}
          `);
        let result;
        try {
            result = JSON.parse(response)
        } catch(e) {
            console.error(`Failed to parse translationWithGrammarHints response for ${dto.text}, ${response}`)
            result = {
                sourceText: dto.text,
                translatedText: "",
                grammarHints: []
            }
        }

        this.insertCacheEntry(dto, result, this._translationWithGrammarHints);
        return result;
    }

    insertCacheEntry(translateRequestDto: any, translateResponseDto: any, service: string) {
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