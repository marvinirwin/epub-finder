import {getSha1} from "../util/sha1";
import connectionPromise from '../../test/connection';
import {Repository} from "typeorm";
import {JsonCache} from "../entities/JsonCache";

interface JsonCacheRow {
    service: string;
    value: any;
    key: string;
    key_hash: string;
}

export function memoWithMySQL<T>(repo: Repository<JsonCache>, serviceKey: string, f: (...a: any[]) => T) {
    const conPromise = connectionPromise(serviceKey).catch(e => console.error(e));
    return async function (...args: any[]) {
        const stringifiedArgs = JSON.stringify(args);
        const connection = await conPromise;
        let sha1Hex = getSha1(stringifiedArgs);
        let rows = [];
        if (connection) {
            rows = await repo.find({
                service: serviceKey,
                key_hash: sha1Hex
            })
        }

        if (!rows.length) {
            const result = await f(...args);
            if (connection) {
                let jsonCache = new JsonCache();
                jsonCache.service = serviceKey;
                jsonCache.key = stringifiedArgs;
                jsonCache.key_hash = sha1Hex;
                jsonCache.value = JSON.stringify(result);
                try {
                    await repo.save(jsonCache)
                } catch(e) {
                    console.warn(e);
                }
            }
            return result;
        }
        return JSON.parse(rows[0].value);
    };
}

