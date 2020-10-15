import dotenv from "dotenv";
dotenv.config({path: ".env"});
import {createConnection, Connection} from "typeorm";
import DatabaseConfig from "../src/config/database.config"
import {MysqlConnectionOptions} from "typeorm/driver/mysql/MysqlConnectionOptions";
import {getSha1} from "../src/util/sha1";
import {User} from "../src/entities/User";
import {JsonCache} from "../src/entities/JsonCache";
import {UsageEvent} from "../src/entities/UsageEvent";
import {Session} from "../src/entities/Session";

const connectionPromise = createConnection(DatabaseConfig as MysqlConnectionOptions).catch(e => {
    throw e;
});

describe(`Database setup`, () => {
    let connection: Connection;
    beforeAll(async () => {
        connection = await connectionPromise;
    })
    it("Can query the tables of all models", async () => {
        const userEntity = User;
        let repository = connection.getRepository(User);
        await connection.getRepository(Session).count();
        await connection.getRepository(UsageEvent).count();
        await connection.getRepository(JsonCache).count();
    });
});

