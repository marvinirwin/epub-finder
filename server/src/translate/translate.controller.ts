import { Controller, Get, Post, Body } from '@nestjs/common';
import {TranslateService} from "./translate.service";
import {TranslateRequestDto} from "./translate-request-dto";
import {TransliterateResponseDto} from "./transliterate-response.dto";
import { transliterate } from './transliterate.service';
import {TransliterateRequestDto} from "./transliterate-request.dto";
import {Public} from "../decorators/public";

@Controller('translate')
export class TranslateController {
    constructor(
        private translateService: TranslateService,
    ) {}

    @Post()
    async translate(@Body() translateRequestDto: TranslateRequestDto) {
        const cacheResult = await this.translateService.lookupCacheEntry(translateRequestDto);
        if (cacheResult) {
            return cacheResult;
        }
        console.log(`Cache miss ${JSON.stringify(translateRequestDto)}`)
        const result = await this.translateService.translate(translateRequestDto);
        this.translateService.insertCacheEntry(translateRequestDto, result);
        return result;
    }

    @Public()
    @Post('/transliterate')
    async transliterate(@Body() transliterateRequestDto: TransliterateRequestDto) {
        const cacheResult = await this.translateService.lookupCacheEntry<TransliterateResponseDto>(transliterateRequestDto);
        if (cacheResult) {
            return cacheResult;
        }
        console.log(`Cache miss ${JSON.stringify(transliterateRequestDto)}`)
        const result = await transliterate(transliterateRequestDto);
        this.translateService.insertCacheEntry(transliterateRequestDto, result);
        return result;
    }
}