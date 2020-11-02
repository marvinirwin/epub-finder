import { Module } from '@nestjs/common';
import {JsonCache} from "../entities/JsonCache";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([JsonCache])
    ],

})
export class TranslateModule {}