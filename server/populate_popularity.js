const dotenv = require("dotenv");
dotenv.config({path: ".env"});
const mysql = require("mysql2/promise");
const [lang, filename] = process.argv.slice(2);
if (!lang || !filename) {
    throw new Error("Language and filename required")
}
console.log(`lang: ${lang} filename: ${filename}`)
const fs = require("fs");
async function query(
    conn,
    sql,
    values
) {
    let result = await (await conn).execute(sql, values);
    if (Array.isArray(result)) {
        return result[0];
    }
    return result;
}
(async () => {
    const con = await mysql.createConnection(
        {
            host: "localhost",
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_USER
        }
    );
    const lines = fs.readFileSync(filename).toString().split('\n');
    await query(con, 'DELETE FROM word_popularity WHERE lang = ?', [lang]);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const [, word, count, percentile] = line.split('\t');
        await query(con, `INSERT INTO word_popularity (lang, word, percentile, count) VALUES (?, ?, ?, ?)`, [lang, word, percentile]);
    }
})();
