require("dotenv").config({path: ".env"});
const {createConnection} = require("mysql");
const [lang] = process.argv.slice(2);
const stream = require("stream");
const {keyBy, uniq} = require("lodash");
const Heap = require("collections/heap");
if (!lang) {
    throw new Error("Language required");
}

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

const textScore = (str, getCharacterScore) => {
    const characters = str.split("");
    let score = 0;
    characters.forEach(character => {
        score += getCharacterScore(character);
    });
    return str.length / score;
};
const memo = (func) => {
    const memo = {};
    return (arg) => {
        if (!memo.hasOwnProperty(arg)) {
            memo[arg] = func(arg);
        }
        return memo[arg];
    }
}


(async () => {
    const con = await createConnection(
        {
            host: "localhost",
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_USER
        }
    );
    const wordRecords = await query(con, "SELECT lang, word, (percentile * 100) as percentile FROM word_popularity WHERE lang = ?", [lang]);
    const grouped = Object.entries(keyBy(wordRecords, "word"));
    const memoTextScore = memo(str => textScore(str, char => {
        if (!char.trim()) return 0;
        if (!grouped[char]) {
            return 100;
        }
        return grouped[char].percentile;
    }));
    for (let i = 0; i < grouped.length; i++) {
        const heap = new Heap(
            [],
            null,
            function (a, b) {
                return textScore(a) - textScore(b);
            }
        );
        const [, {lang, word, percentile}] = grouped[i];
        await new Promise(resolve => {
            con.query("SELECT article_id, text_content WHERE text_content LIKE ?", [`%${word}%`])
                .stream()
                .pipe(stream.Transform({
                    objectMode: true,
                    transform: function (row, encoding, callback) {
                        heap.push(row)
                        callback();
                    }
                })).on("finish", resolve)
        });
    }

    await query(con, "DELETE FROM word_popularity WHERE lang = ?", [lang]);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const [, word, , percentile] = line.split("\t");
        await query(con, `INSERT INTO word_popularity (lang, word, percentile) VALUES (?, ?, ?)`, [lang, word, percentile]);
    }
})();
