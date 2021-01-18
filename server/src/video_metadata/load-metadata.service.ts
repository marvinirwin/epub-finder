import {Inject, OnModuleInit} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Document} from "../entities/document.entity";
import {Repository} from "typeorm";
import {DocumentView} from "../entities/document-view.entity";
import fs from "fs-extra";
import {join, parse} from "path";
import {sha1} from "../util/sha1";
import {startCase} from "lodash";
import {VideoMetadata} from "../entities/video.metadata";
import {VideoMetadataService} from "./video-metadata.service";

export class LoadMetadataService implements OnModuleInit {

    constructor(
        @InjectRepository(VideoMetadata)
        private videoMetadataRepository: Repository<VideoMetadata>,
        @Inject(VideoMetadataService)
        private videoMetadataService: VideoMetadataService
    ) {
    }

    async onModuleInit() {
        const files = await fs.promises.readdir(process.env.VIDEO_DIR);
        return Promise.all(files.filter(f => f.endsWith('json')).map(async file => {
            const hash = file.split('.').slice(0, -1).join('');
            await this.videoMetadataService.checkForJson(hash)
        }))
    }
}
