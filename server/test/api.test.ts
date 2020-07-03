import request = require('supertest');
import app from "../src/app";
import {getConnection, query} from "../src/util/mysql";
import {getSha1} from "../src/util/sha1";
import {TranslationRequest} from "../src/controllers/Translate";
import {ImageSearchRequest} from "../src/controllers/ImageSearch";

const connection = getConnection();

describe("POST /translate", () => {
    const hash = getSha1(JSON.stringify([{
        from: 'zh-CN',
        to: 'en',
        text: "你好"
    }]));

    beforeEach(async () => {
        await query(connection, 'DELETE FROM `json_cache` WHERE `key_hash` = ?', [hash]);
    })
    it("Should return a translation and put something in the cache", async () => {
        await request(app).post("/translate")
            .send([{
                from: 'zh-CN',
                to: 'en',
                text: "你好"
            }][0]).expect(200);
        // Now check the cache
        const rows = await query(connection, 'SELECT * FROM `json_cache` WHERE `key_hash` = ?', [hash]);
        expect(rows).toHaveLength(1);
    });
});

describe("POST /image-search", () => {
    let key: ImageSearchRequest[] = [{
        term: '你好'
    }];
    const hash = getSha1(JSON.stringify(key));
    beforeEach(async () => {
        await query(connection, 'DELETE FROM `json_cache` WHERE `key_hash` = ?', [hash]);
    })
    it("Should return an image search response and put something in the cache", async () => {
        await request(app).post("/image-search")
            .send(key[0]).expect(200);
        // Now check the cache
        const rows = await query(connection, 'SELECT * FROM `json_cache` WHERE `key_hash` = ?', [hash]);
        expect(rows).toHaveLength(1);
    });
});
