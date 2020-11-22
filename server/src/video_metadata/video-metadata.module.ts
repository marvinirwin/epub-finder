import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {VideoMetadataViewEntity} from "../entities/video-metadata-view.entity";
import {VideoMetadataEntity} from "../entities/video-metadata.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([VideoMetadataViewEntity, VideoMetadataEntity])
    ],
    providers: [ ]
})
export class VideoMetadataModule {}
