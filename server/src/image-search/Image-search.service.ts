import {Injectable} from '@nestjs/common';
import {ImageSearchRequestDto} from "./image-search-request-dto";
import {CognitiveServicesCredentials} from "@azure/ms-rest-azure-js";
import {ImageSearchClient, ImageSearchModels} from "@azure/cognitiveservices-imagesearch";
import {TranslateRequestDto} from "../translate/translate-request-dto";
import {TranslateResponseDto} from "../translate/translate-response-dto";
import {sha1} from "../util/sha1";
import {InjectRepository} from "@nestjs/typeorm";
import {JsonCacheEntity} from "../entities/json-cache.entity";
import {Repository} from "typeorm";
import debug from 'debug'
const d = debug('service:image-search');

export const imageSearchEndPoint = process.env["AZURE_IMAGE_SEARCH_ENDPOINT"];
export const imageSearchKey = process.env["AZURE_IMAGE_SEARCH_KEY"] as string;

const cognitiveServiceCredentials = new CognitiveServicesCredentials(
    imageSearchKey
);

const client = new ImageSearchClient(cognitiveServiceCredentials, {
    endpoint: imageSearchEndPoint
});

@Injectable()
export class ImageSearchService {
    private readonly _service = 'AZURE_IMAGE_SEARCH'
    constructor(
        @InjectRepository(JsonCacheEntity)
        private jsonCacheRepository: Repository<JsonCacheEntity>,
    ) { }

    async fetchSearchResults({term}: ImageSearchRequestDto) {
        const options: ImageSearchModels.ImagesSearchOptionalParams = {
            count: 30,
            // imageType: "Photo"  Maybe I also want gifs?  What's this param for?
        };
        return (await client.images.search(term, options)).value
    }
    async lookupCacheEntry(imageSearchRequestDto: ImageSearchRequestDto): Promise<ImageSearchRequestDto | undefined> {
        const conditions = {
            service: this._service,
            key_hash: sha1([imageSearchRequestDto])
        };
        const cacheEntry = await this.jsonCacheRepository.findOne(conditions);
        d(conditions);
        if (cacheEntry) {
            // Kind of inefficient, since it will probably be stringified again again
            return JSON.parse(cacheEntry.value);
        }
    }

    insertCacheEntry(imageSearchRequestDto: ImageSearchRequestDto, imageSearchResponseDto: any) {
        const cacheEntry = {
            service: this._service,
            key_hash: sha1([imageSearchRequestDto]),
            key: JSON.stringify([imageSearchRequestDto]),
            value: JSON.stringify(imageSearchResponseDto)
        };
        d(cacheEntry)
        this.jsonCacheRepository.save(
            Object.assign(
                new JsonCacheEntity(),
                cacheEntry
            )
        )
    }
}