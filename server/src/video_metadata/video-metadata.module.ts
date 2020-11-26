import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {VideoMetadataViewEntity} from "../entities/video-metadata-view.entity";
import {VideoMetadataEntity} from "../entities/video.metadata";
import {VideoMetadataController} from "./video-metadata.controller";
import {VideoMetadataService} from "./video-metadata.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([VideoMetadataViewEntity, VideoMetadataEntity])
    ],
    controllers: [
        VideoMetadataController
    ],
    providers: [
        VideoMetadataService
    ]
})
export class VideoMetadataModule {}
