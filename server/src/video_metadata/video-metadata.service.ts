import {InjectRepository} from "@nestjs/typeorm";
import {Column, Generated, Repository} from "typeorm";
import {VideoMetadataViewEntity} from "../entities/video-metadata-view.entity";
import {VideoMetadata} from "../entities/video.metadata";
import {VideoMetadataDto} from "./video-metadata.dto";
import {sha1} from "../util/sha1";
import fs from 'fs-extra';
import { join } from "path";

export class VideoMetadataService {
    constructor(
        @InjectRepository(VideoMetadataViewEntity)
        private videoMetadataViewEntityRepository: Repository<VideoMetadataViewEntity>,

        @InjectRepository(VideoMetadata)
        private videoMetadataEntityRepository: Repository<VideoMetadata>,
    ) {

    }
    public async resolveVideoMetadataByHash(hash: string): Promise<VideoMetadata | undefined> {
        const record = await this.videoMetadataViewEntityRepository.findOne({sentenceHash: hash});
        if (record) {
            return record;
        }
        const json = await this.checkForJson(hash);
        if (json) {
            return json;
        }
    }
    public async checkForJson(hash: string): Promise<VideoMetadata | undefined>{
        const filename = `${hash}.json`;
        const filePath = join(process.env.VIDEO_DIR, filename);
        if (await fs.pathExists(filePath)) {
            const metadata: {sentence: string} = await fs.readJson(filePath)
            console.log(metadata);
            return await this.videoMetadataEntityRepository.save({
                sentence: metadata.sentence,
                sentenceHash: hash,
                metadata: JSON.stringify(metadata),
            })
        }
    }

    public async saveVideoMetadata(videoMetadataDto: VideoMetadataDto): Promise<VideoMetadata> {
        return await this.videoMetadataEntityRepository.save(videoMetadataDto)
    }
}