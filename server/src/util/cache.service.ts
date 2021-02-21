import {InjectRepository} from "@nestjs/typeorm";
import {JsonCache} from "../entities/json-cache.entity";
import {Repository} from "typeorm";
import {sha1} from "./sha1";
import {SerializedTabulation} from "../shared";

export class CacheService {
    constructor(
        @InjectRepository(JsonCache)
        private jsonCacheRepository: Repository<JsonCache>,
    ) {
    }

    public async memo<T>({
                             args, service, cb
                         }: { service: string, args: any[], cb: () => Promise<T> }): Promise<T> {
        const key = args;
        const keyHash = sha1(key);
        const tabulationCacheEntry = await this.jsonCacheRepository.findOne({
            service,
            key_hash: keyHash
        });
        if (tabulationCacheEntry) {
            return JSON.parse(tabulationCacheEntry.value) as T
        }
        console.log(`${service} cache miss`);
        const result = await cb();
        await this.jsonCacheRepository.insert({
            service,
            key: JSON.stringify(key),
            key_hash: keyHash,
            value: JSON.stringify(result),
        })
        return result;
    }
}