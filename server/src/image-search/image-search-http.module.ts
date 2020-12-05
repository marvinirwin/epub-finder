import { Module } from '@nestjs/common';
import { ImageSearchModule } from './image-search.module';
import { ImageSearchService } from './image-search.service';
import { ImageSearchController } from './image-search.controller';
import {TranslateModule} from "../translate/translate.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {JsonCache} from "../entities/json-cache.entity";

@Module({
    imports: [
        ImageSearchModule,
        TypeOrmModule.forFeature([JsonCache])
    ],
    providers: [ImageSearchService],
    controllers: [ImageSearchController]
})
export class ImageSearchHttpModule {}
