import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {JsonCache} from "../entities/json-cache.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([JsonCache])
    ],
})
export class ImageSearchModule {}