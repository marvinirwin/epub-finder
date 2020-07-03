const mysql = require('mysql2/promise');
var crypto = require('crypto')

// create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD
});





export function memoWithMySQL(serviceKey: string, f: (...a: any[]) => any) {
    return async function (...args: any[]) {
        const key = JSON.stringify(args);
        const sha = crypto.createHash('sha1')
        sha.update(key)
        let sha1Hex = sha.digest('hex');
        const [rows, fields] = await (await connection).execute(
            "SELECT `value` FROM `json_cache` WHERE `service` = ? AND `key_hash` = ?",
            [
                serviceKey,
                sha1Hex
            ]
        );

        if (!rows.length) {
            const result  = await f(...args);
            const [rows, fields] = await (await connection).execute(
                "INSERT INTO `json_cache` (`service`, `key`, `key_hash`, `value`) VALUES (?, ?, ?, ?)",
                [
                    serviceKey,
                    key,
                    sha1Hex,
                ]
            );
            return result;
        }
        return rows[0].value;
    };
}


