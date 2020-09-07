require("dotenv").config({path: ".env"});
const {createConnection} = require("mysql");
const [sampleSize, ...words] = process.argv.slice(2);
const stream = require("stream");
const {keyBy, uniq} = require("lodash");
const Heap = require("collections/heap");
const hsk1 = new Set(require("../reader/src/lib/HSK/hsk-level-1.json").map(({hanzi}) => hanzi));

async function run() {
    const con = await createConnection(
        {
            host: "localhost",
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_USER
        }
    );
    for (let i = 0; i < words.length; i++) {
        await nSimplestSentences(
            words[i],
            hsk1,
            con.query("SELECT article_id, text_content FROM article_element WHERE text_content LIKE ? LIMIT ?", [`%${words[i]}%`, parseInt(sampleSize)]).stream(),
            20
        );
    }
}

/**
 *
 * @param word string
 * @param vocab Set<string>
 * @param sentenceSampleStream Stream<string>
 * @param n
 * @returns {Promise<void>}
 */
function nSimplestSentences(word, vocab, sentenceSampleStream, n) {
    const sentenceComplexityMaxHeap = new Heap([], null, (a, b) => {
        return memoTextScore(b) - memoTextScore(a);
    });
    const memoTextScore = memo(str => textScore(str, char => {
        if (word === char) {
            return -1;
        }
        // No complexity for characters I know
        if (vocab.has(char)) return 0.0001;
        // Add 1 complexity for whitespace
        if (!char.trim()) return 1;
        // If it's a chinese character I dont know then return 2 complexity
        if (isChineseCharacter(char)) {
            return 10;
        }
        // If it's not chinese and I dont know it;
        return 20;

    }));
    return new Promise(resolve => {
        sentenceSampleStream.pipe(stream.Transform({
            objectMode: true,
            transform: function (el, encoding, callback) {
                el.text_content.split('\n').forEach(line => sentenceComplexityMaxHeap.push(line));
                while (sentenceComplexityMaxHeap.length > n) {
                    sentenceComplexityMaxHeap.pop();
                }
                callback();
            }
        })).on("finish", () => {
            let word;
            while (word = sentenceComplexityMaxHeap.pop()) {
                console.log(`${word} ${memoTextScore(word)}`)
            }
            resolve(sentenceComplexityMaxHeap.toArray());
        });
    });
}

const memo = (func) => {
    const memo = {};
    return (arg) => {
        if (!memo.hasOwnProperty(arg)) {
            memo[arg] = func(arg);
        }
        return memo[arg];
    };
};

const textScore = (str, getCharacterScore) => {
    const characters = str.split("");
    let score = 0;
    let chineseCharacterCount = 0;
    characters.forEach(character => {
        score += getCharacterScore(character);
        if (isChineseCharacter) chineseCharacterCount++;
    });

    return score / Math.pow(chineseCharacterCount, -2);
};

const isChineseCharacter = memo((char) => {
    return char.match(/[\u4E00-\uFA29]/);
});

run();
/*
function query(
    conn,
    sql,
    values
) {
    return new Promise((resolve, reject) => {
        conn.query(sql, values, (error, results, fields) => {
            if (error) reject(error);
            resolve(results);
        });
    });
}
*/

