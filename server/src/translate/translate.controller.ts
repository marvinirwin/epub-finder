import { Controller, Get, Post, Body } from '@nestjs/common';
import {TranslateService} from "./translate.service";
import {TranslateRequestDto} from "./translate-request-dto";

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
        const cost = JSON.stringify(translateRequestDto).length * 4;
        const result = await this.translateService.translate(translateRequestDto);
        this.translateService.insertCacheEntry(translateRequestDto, result);
        return result;
    }
}