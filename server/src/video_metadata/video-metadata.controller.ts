import {VideoMetadataService} from "./video-metadata.service";
import {Body, Controller, Get, Header, Param, Post, Put, HttpStatus, HttpCode} from "@nestjs/common";
import {VideoMetadataDto} from "./video-metadata.dto";
import {sha1} from "../util/sha1";
import {zip, zipObject} from "lodash";


@Controller('video_metadata')
export class VideoMetadataController {
    constructor(private videoMetadataService: VideoMetadataService) {
    }

    @Get(":hash")
    @Header('content-type', 'application/json')
    async metadata(@Param() {hash}) {
        return (await this.videoMetadataService.resolveVideoMetadataByHash(hash))?.metadata
    }

    @Put()
    async put(@Body() videoMetadataDto: VideoMetadataDto) {
        return this.videoMetadataService.saveVideoMetadata(videoMetadataDto);
    }

    @Post()
    @HttpCode(200)
    @Header('content-type', 'application/json')
    async bulkMetadata(@Body() sentenceList: string[]) {
        const allMetadata = await Promise.all(
            sentenceList
                .map(sentence => this.videoMetadataService.resolveVideoMetadataByHash(sha1(sentence))
                    .then(metadataEntity => metadataEntity?.metadata ? JSON.parse(metadataEntity.metadata) : undefined))
        );
        return zipObject(sentenceList, allMetadata);
    }
}