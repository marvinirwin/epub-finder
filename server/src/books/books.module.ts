import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {VideoMetadataViewEntity} from "../entities/video-metadata-view.entity";
import {VideoMetadataEntity} from "../entities/video-metadata.entity";
import {BookEntity} from "../entities/book.entity";
import {BookViewEntity} from "../entities/book-view.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([BookEntity, BookViewEntity])
    ],
    providers: [ ]
})
export class BooksModule {}
