const dotenv = require("dotenv");
dotenv.config({path: ".env"});
const parser = require("./sax").parser(true);
const fs = require("fs");
const [filename] = process.argv.slice(2);
console.log(`Reading ${filename}`);
const readStream = fs.createReadStream(filename, {highWaterMark: 1 * 1024, encoding: "utf8"});
const mysql = require("mysql2/promise");
const con = mysql.createConnection(
    {
        host: "localhost",
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_USER
    }
);

function formatBytes(a, b = 2) {
    if (0 === a) return "0 Bytes";
    const c = 0 > b ? 0 : b, d = Math.floor(Math.log(a) / Math.log(1024));
    return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d];
}

async function query(
    conn,
    sql,
    values
) {
    let newVar = await (await conn).execute(sql, values);
    if (Array.isArray(newVar)) {
        return newVar[0];
    }
    return;
}

class TagInProgress {
    constructor(tag, attributes) {
        this.tag = tag;
        this.attributes = attributes;
        this.text = "";
        this.children = [];
    }
}

const parseAttributes = attrArray => Object.fromEntries(attrArray.map(([key, prefix, uri, value]) => [key, value]));

(async () => {
    let processing = true;
    let tagStack = [];
    let saveQue = [];
    parser.onerror = msg => {
        console.log(`Error: ${msg}`);
    };
    parser.ontext = characters => {
        const currentTag = tagStack[tagStack.length - 1];
        if (currentTag) {
            currentTag.text += characters;
        } else {
        }
    };
    parser.onopentag = ({name, attributes}) => {
        const attrs = attributes;
        switch (name) {
            case "wikipedia":
            case "article":
            case "redirect":
            case "links_in":
            case "textlink":
            case "category":
            case "links_out":
            case "crosslanguage_link":
            case "disambiguation":
            case "content":
            case "link":
            case "math":
            case "table":
            case "cell":
            case "p":
            case "h":
                // Insert the article
                const newTagInProgress = new TagInProgress(name, attrs);
                const parent = tagStack[tagStack.length - 1];
                if (parent) {
                    parent.children.push(newTagInProgress);
                }
                tagStack.push(newTagInProgress);
                break;
            default:
                throw new Error(`Unknown tag ${name}`);
        }
    };
    parser.onclosetag = () => {
        const finishedTag = tagStack.pop();
        if (tagStack.length === 1) {
            saveQue.push(finishedTag);
        } else if (!tagStack.length) {
            processing = false;
        }
    };

    readStream.on("data", async function (chunk) {
        while (saveQue.length > 100) {
            if (!readStream.isPaused()) {
                readStream.pause();
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (readStream.isPaused()) {
            readStream.resume();
        }
        parser.write(chunk);
    }).on("end", function () {
        console.log(`Finished reading ${filename}`);
// here you see all data processed at end of file
    });


    /**
     * @param node
     * @returns string
     */
    function getTextAndChildrenText(node) {
        return [node.text].concat(node.children.map(getTextAndChildrenText)).join("\n");
    }

    async function insertTag(tag, parentId, articleId) {
        const {insertId: id} = await query(
            con,
                `INSERT INTO article_element (tag, parent_id, text_content, article_id) VALUES (?, ? ,?, ?)`,
            [tag.tag, parentId, tag.text, articleId]
        );
        for (let i = 0; i < tag.children.length; i++) {
            const child = tag.children[i];
            await insertTag(child, id, articleId);
        }
    }

    const articleName = saveItem.attributes.name;
    await query(con, `
                DELETE article, article_element 
                FROM article LEFT JOIN article_element USING (article_id) 
                ORDER BY article_id DESC 
                LIMIT 1;
        `,
        [articleName]
    );
    while (processing) {
        await new Promise(resolve => setTimeout(resolve, 0));

        let saveItem;
        while (saveItem = saveQue.shift()) {
            console.log(`Trying to save ${saveItem.attributes.name} Save que length: ${saveQue.length}`);
            try {
                const result = await query(con, `SELECT article_id FROM article WHERE article_name = ?`, [articleName]);
                if (result.length) {
                    console.log(`${articleName} is already present in the database, skipping.`)
                    continue;
                }
                const textContent = getTextAndChildrenText(saveItem);

                const {insertId: article_id} = await query(
                    con,
                        `INSERT INTO article (article_name, text_content) VALUES (?, ?)`,
                    [saveItem.attributes.name, textContent]
                );
                for (let i = 0; i < saveItem.children.length; i++) {
                    const child = saveItem.children[i];
                    await insertTag(child, null, article_id);
                }
                console.log(`Inserted ${saveItem.attributes.name} with ${saveItem.children.length} children`);
            } catch (e) {
                console.log(`Could not save ${saveItem.attributes.name}`);
                console.error(e);
            }
            console.log(Object.fromEntries(Object.entries(process.memoryUsage()).map(([k, v]) => [k, formatBytes(v)])));
        }
    }
})();


