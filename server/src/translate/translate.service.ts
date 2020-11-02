import {Injectable} from '@nestjs/common';
import {TranslateRequestDto} from "./translate-request-dto";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {JsonCache} from "../entities/JsonCache";
import {TranslateResponseDto} from "./translate-response-dto";
import {sha1} from "../util/sha1";

const {Translate} = require("@google-cloud/translate").v2;
export const projectId = "mandarin-trainer";
export const translate = new Translate({projectId});

@Injectable()
export class TranslateService {
    constructor(
        @InjectRepository(JsonCache)
        private jsonCacheRepository: Repository<JsonCache>,
    ) {
    }

    async translate({text, to}: TranslateRequestDto) {
        const [translation] = await translate.translate(text, to);
        return {translation};
    }

    private readonly _service = "GOOGLE_TRANSLATIONS";

    async lookupCacheEntry(translateRequestDto: TranslateRequestDto): Promise<TranslateResponseDto | undefined> {
        const conditions = {
            service: this._service,
            key_hash: sha1([translateRequestDto])
        };
        const cacheEntry = await this.jsonCacheRepository.findOne(conditions);
        if (cacheEntry) {
            // Kind of inefficient, since it will probably be stringified again
            return JSON.parse(cacheEntry.value);
        }
    }

    insertCacheEntry(translateRequestDto: TranslateRequestDto, translateResponseDto: TranslateResponseDto) {
        this.jsonCacheRepository.save(
            Object.assign(
                new JsonCache(),
                {
                    service: this._service,
                    key_hash: sha1([translateRequestDto]),
                    key: JSON.stringify([translateRequestDto]),
                    value: JSON.stringify(translateResponseDto)
                }
            )
        )
    }
}