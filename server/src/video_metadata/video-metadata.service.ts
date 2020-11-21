import {InjectRepository} from "@nestjs/typeorm";
import {Column, Generated, Repository} from "typeorm";
import {VideoMetadataViewEntity} from "../entities/video-metadata-view.entity";
import {VideoMetadataEntity} from "../entities/video-metadata.entity";
import {VideoMetadataDto} from "./video-metadata.dto";
import {sha1} from "../util/sha1";
import fs from 'fs-extra';
import { join } from "path";

export class VideoMetadataService {
    constructor(
        @InjectRepository(VideoMetadataViewEntity)
        private videoMetadataViewEntityRepository: Repository<VideoMetadataViewEntity>,

        @InjectRepository(VideoMetadataEntity)
        private videoMetadataEntityRepository: Repository<VideoMetadataEntity>,
    ) {

    }
    public async resolveVideoMetadataBySentence(sentence: string): Promise<VideoMetadataEntity | undefined> {
        const record = await this.videoMetadataViewEntityRepository.findOne({sentenceHash: sha1(sentence)});
        if (record) {
            return record;
        }
        const json = await this.checkForJson(sentence);
        if (json) {
            return json;
        }
    }
    public async checkForJson(sentence: string): Promise<VideoMetadataEntity | undefined>{
        const filename = `${sha1(sentence)}.json`;
        if (await fs.pathExists(join(process.env.VIDEO_DIR, filename))) {
            return await this.videoMetadataEntityRepository.save({
                sentence,
                sentenceHash: sha1(sentence),
                metadata: (await fs.readFileSync(filename)).toString(),
            })
        }
    }

    public async saveVideoMetadata(videoMetadataDto: VideoMetadataDto): Promise<VideoMetadataEntity> {
        return await this.videoMetadataEntityRepository.save(videoMetadataDto)
    }
}