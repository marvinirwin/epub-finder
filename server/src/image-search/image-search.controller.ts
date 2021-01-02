import { Controller, Get, Post, Body } from '@nestjs/common';
import {ImageSearchService} from "./image-search.service";
import {ImageSearchRequestDto} from "./image-search-request-dto";

@Controller('image-search')
export class ImageSearchController {
    constructor(private imageSearchService: ImageSearchService) {}

    @Post()
    async search(@Body() imageSearchRequestDto: ImageSearchRequestDto) {
        const cached = await this.imageSearchService.lookupCacheEntry(imageSearchRequestDto);
        if (cached) {
            console.log(`Cache hit ${JSON.stringify(imageSearchRequestDto)}`)
            return cached;
        }
        console.log(`Cache miss ${JSON.stringify(imageSearchRequestDto)}`)
        const result = await this.imageSearchService.fetchSearchResults(imageSearchRequestDto);
        this.imageSearchService.insertCacheEntry(imageSearchRequestDto, result);
        return result;
    }
}