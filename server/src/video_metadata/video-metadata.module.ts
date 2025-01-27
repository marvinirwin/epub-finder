import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VideoMetadataView } from "../entities/video-metadata-view.entity";
import { VideoMetadataEntity } from "../entities/video-metadata.entity";
import { VideoMetadataController } from "./video-metadata.controller";
import { VideoMetadataService } from "./video-metadata.service";
import { LoadMetadataService } from "./load-metadata.service";

@Module({
    imports: [TypeOrmModule.forFeature([VideoMetadataView, VideoMetadataEntity])],
    controllers: [VideoMetadataController],
    providers: [VideoMetadataService, LoadMetadataService],
})
export class VideoMetadataModule {}
