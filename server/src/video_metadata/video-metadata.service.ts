import {InjectRepository} from "@nestjs/typeorm";
import {Column, Generated, Repository} from "typeorm";
import {VideoMetadataView} from "../entities/video-metadata-view.entity";
import {VideoMetadata} from "../entities/video.metadata";
import {VideoMetadataDto} from "./video-metadata.dto";
import {sha1} from "../util/sha1";
import fs from 'fs-extra';
import {join} from "path";

export class VideoMetadataService {
    constructor(
        @InjectRepository(VideoMetadataView)
        private videoMetadataViewEntityRepository: Repository<VideoMetadataView>,
        @InjectRepository(VideoMetadata)
        private videoMetadataEntityRepository: Repository<VideoMetadata>,
    ) {
    }

    public async resolveVideoMetadataByHash(hash: string): Promise<VideoMetadata | undefined> {
        const record = await this.videoMetadataViewEntityRepository.findOne({sentence_hash: hash});
        if (record) {
            return record;
        }
        const json = await this.checkForJson(hash);
        if (json) {
            return json;
        }
    }

    public async allVideoMetadata() {
        return this.videoMetadataEntityRepository.find();
    }

    public async checkForJson(sentence_hash: string): Promise<VideoMetadata | undefined> {
        const existingMetadata = await this.videoMetadataEntityRepository.findOne({sentence_hash});
        const filename = `${sentence_hash}.json`;
        const filePath = join(process.env.VIDEO_DIR, filename);
        if (existingMetadata) {
            return existingMetadata;
        }
        if (await fs.pathExists(filePath)) {
            const metadata: { sentence: string } = await fs.readJson(filePath);
            if (metadata.sentence) {
                console.log(JSON.stringify(metadata));
                return await this.videoMetadataEntityRepository.save({
                    sentence: metadata.sentence,
                    sentence_hash: sentence_hash,
                    metadata: JSON.stringify(metadata),
                });
            } else {
                console.log(`json file without sentence? ${filePath}`);
            }
        }
    }

    public async saveVideoMetadata(videoMetadataDto: VideoMetadataDto): Promise<VideoMetadata> {
        const sentence_hash = sha1(videoMetadataDto.metadata.sentence);
        const existingMetadata = await this.videoMetadataViewEntityRepository
            .findOne({sentence_hash});

        const baseMetadata: Partial<VideoMetadata> = {
            sentence: videoMetadataDto.metadata.sentence,
            sentence_hash: sentence_hash,
            metadata: JSON.stringify(videoMetadataDto.metadata)
        }
        if (existingMetadata) {
            return await this.videoMetadataEntityRepository.save(
                Object.assign(
                    new VideoMetadata(),
                    {
                        video_metadata_id: existingMetadata.video_metadata_id,
                        ...baseMetadata
                    }
                )
            );
        } else {
            return await this.videoMetadataEntityRepository.save(
                Object.assign(
                    new VideoMetadata(),
                    baseMetadata
                )
            );
        }
    }
}