import { config } from "dotenv";
import * as path from "path";
import { TypeOrmModule } from "@nestjs/typeorm";

config({ path: ".env" });

const baseDir = path.join(__dirname, "../");
const entitiesPath = `${baseDir}${process.env.TYPEORM_ENTITIES}`;
const migrationPath = `${baseDir}${process.env.TYPEORM_MIGRATIONS}`;

const host = process.env.TYPEORM_HOST;
const username = process.env.TYPEORM_USERNAME;
const password = process.env.TYPEORM_PASSWORD;
const database = process.env.TYPEORM_DATABASE;
const port = process.env.TYPEORM_PORT;
export const DatabaseModule = TypeOrmModule.forRoot({
    // @ts-ignore
    type: "postgres",
    host: host,
    username: username,
    password: password,
    database: database,
    port: Number.parseInt(port, 10),
    entities: [entitiesPath],
    migrations: [migrationPath],
    migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === "true",
    cli: {
        migrationsDir: "src/migrations",
        entitiesDir: "src/entities",
    },
    synchronize: true,
    // @ts-ignore I dunno what this is for, it might be removable
    timezone: "Z",
});
