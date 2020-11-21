import { Module } from '@nestjs/common';
import {JsonCacheEntity} from "../entities/json-cache.entity";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([JsonCacheEntity])
    ],

})
export class TranslateModule {}