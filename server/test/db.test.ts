import dotenv from "dotenv";
dotenv.config({path: ".env"});
import {createConnection, Connection} from "typeorm";
import {getSha1} from "../src/util/sha1";
import {User} from "../src/entities/User";
import {JsonCache} from "../src/entities/JsonCache";
import {UsageEvent} from "../src/entities/UsageEvent";
import {Session} from "../src/entities/Session";
import connectionPromise from './connection';

describe(`Database setup`, () => {
    let connection: Connection;
    beforeAll(async () => {
        connection = await connectionPromise;
    })
    it("Can query the tables of all models", async () => {
        console.log(await connection.getRepository(User).count());
        console.log(await connection.getRepository(UsageEvent).count());
        console.log(await connection.getRepository(JsonCache).count());
        console.log(await connection.getRepository(Session).count());
    });
});
