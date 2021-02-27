import {config} from 'dotenv';
import * as path from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';

config({path: '.env'});

const baseDir = path.join(__dirname, '../');
const entitiesPath = `${baseDir}${process.env.TYPEORM_ENTITIES}`;
const migrationPath = `${baseDir}${process.env.TYPEORM_MIGRATIONS}`;

export const DatabaseModule = TypeOrmModule.forRoot({
    // @ts-ignore
    type: process.env.TYPEORM_CONNECTION,
    host: process.env.TYPEORM_HOST,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    port: Number.parseInt(process.env.TYPEORM_PORT, 10),
    entities: [entitiesPath],
    migrations: [migrationPath],
    migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true',
    seeds: [`src/db/seeds/*.seed.ts`],
    cli: {
        migrationsDir: 'src/migrations',
        entitiesDir: 'src/entities',
    },
    synchronize: true,
});
