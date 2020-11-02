import {Injectable} from '@nestjs/common';
import {ImageSearchRequestDto} from "./image-search-request-dto";
import {CognitiveServicesCredentials} from "@azure/ms-rest-azure-js";
import {ImageSearchClient, ImageSearchModels} from "@azure/cognitiveservices-imagesearch";
import {TranslateRequestDto} from "../translate/translate-request-dto";
import {TranslateResponseDto} from "../translate/translate-response-dto";
import {getSha1} from "../util/sha1";
import {InjectRepository} from "@nestjs/typeorm";
import {JsonCache} from "../entities/JsonCache";
import {Repository} from "typeorm";

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
        @InjectRepository(JsonCache)
        private jsonCacheRepository: Repository<JsonCache>,
    ) { }

    async fetchSearchResults({term}: ImageSearchRequestDto) {
        const options: ImageSearchModels.ImagesSearchOptionalParams = {
            count: 30,
            // imageType: "Photo"  Maybe I also want gifs?  What's this param for?
        };
        return (await client.images.search(term, options)).value
    }
    async lookupCacheEntry(imageSearchRequestDto: ImageSearchRequestDto): Promise<ImageSearchRequestDto | undefined> {
        const cacheEntry = await this.jsonCacheRepository.findOne({
            service: "AZURE_IMAGE_SEARCH",
            key_hash: getSha1(JSON.stringify(imageSearchRequestDto)
            )
        });
        if (cacheEntry) {
            // Kind of inefficient, since it will probably be stringified again again
            return JSON.parse(cacheEntry.value);
        }
    }

    private hash(translateRequestDto: any) {
        return getSha1(JSON.stringify(translateRequestDto));
    }

    insertCacheEntry(imageSearchRequestDto: ImageSearchRequestDto, imageSearchResponseDto: any) {
        this.jsonCacheRepository.save(
            Object.assign(
                new JsonCache(),
                {
                    service: this._service,
                    key_hash: this.hash(imageSearchRequestDto),
                    key: JSON.stringify(imageSearchRequestDto),
                    value: JSON.stringify(imageSearchResponseDto)
                }
            )
        )
    }
}