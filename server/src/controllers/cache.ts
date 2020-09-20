import {getSha1} from "../util/sha1";
import {getConnection, query} from "../util/mysql";

const connection = getConnection();

interface JsonCacheRow {
    service: string;
    value: any;
    key: string;
    key_hash: string;
}

export function memoWithMySQL<T>(serviceKey: string, f: (...a: any[]) => T) {
    return async function (...args: any[]) {
        const stringifiedArgs = JSON.stringify(args);
        let sha1Hex = getSha1(stringifiedArgs);
        const rows = await query<JsonCacheRow>(connection,
            'SELECT `value` FROM `json_cache` WHERE `service` = ? AND `key_hash` = ?',
            [
                serviceKey,
                sha1Hex
            ])

        if (!rows.length) {
            const result = await f(...args);
            await query<JsonCacheRow>(connection,
                'INSERT INTO `json_cache` (`service`, `key`, `key_hash`, `value`) VALUES (?, ?, ?, ?)',
                [
                    serviceKey,
                    stringifiedArgs,
                    sha1Hex,
                    JSON.stringify(result)
                ]
            )
            return result;
        }
        return rows[0].value;
    };
}


