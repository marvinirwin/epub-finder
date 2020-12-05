import { Module } from '@nestjs/common';
import { TranslateModule } from './translate.module';
import { TranslateService } from './translate.service';
import { TranslateController } from './translate.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {JsonCache} from "../entities/json-cache.entity";

@Module({
    imports: [
        TranslateModule,
        TypeOrmModule.forFeature([JsonCache])
    ],
    providers: [TranslateService],
    controllers: [TranslateController]
})
export class TranslateHttpModule {}
