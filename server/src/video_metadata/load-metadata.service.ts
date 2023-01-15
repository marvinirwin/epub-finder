import { Inject, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import fs from "fs-extra";
import { VideoMetadata } from "../entities/video.metadata";
import { VideoMetadataService } from "./video-metadata.service";

export class LoadMetadataService implements OnModuleInit {
    constructor(
        @InjectRepository(VideoMetadata)
        private videoMetadataRepository: Repository<VideoMetadata>,
        @Inject(VideoMetadataService)
        private videoMetadataService: VideoMetadataService,
    ) {}

    async onModuleInit() {
        // TODO reimplement this with S3
        const files = /*await fs.promises.readdir(process.env.VIDEO_DIR);*/[];
        return Promise.all(
            files
                .filter((f) => f.endsWith("json"))
                .map(async (file) => {
                    const hash = file.split(".").slice(0, -1).join("");
                    await this.videoMetadataService.checkForJson(hash);
                }),
        );
    }
}
