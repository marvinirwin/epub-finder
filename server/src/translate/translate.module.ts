import { Module } from '@nestjs/common';
import {JsonCache} from "../entities/json-cache.entity";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([JsonCache])
    ],

})
export class TranslateModule {}