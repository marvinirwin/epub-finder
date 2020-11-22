import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {VideoMetadataViewEntity} from "../entities/video-metadata-view.entity";
import {VideoMetadata} from "../entities/video.metadata";
import {VideoMetadataController} from "./video-metadata.controller";
import {VideoMetadataService} from "./video-metadata.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([VideoMetadataViewEntity, VideoMetadata])
    ],
    controllers: [
        VideoMetadataController
    ],
    providers: [
        VideoMetadataService
    ]
})
export class VideoMetadataModule {}
