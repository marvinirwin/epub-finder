import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {JsonCacheEntity} from "../entities/json-cache.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([JsonCacheEntity])
    ],
})
export class SpeechModule {}