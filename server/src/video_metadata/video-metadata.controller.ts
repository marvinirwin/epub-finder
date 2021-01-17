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
    async metadataForHash(@Param() {hash}) {
        return (await this.videoMetadataService.resolveVideoMetadataByHash(hash))?.metadata
    }

    @Put()
    async put(@Body() videoMetadataDto: VideoMetadataDto) {
        return this.videoMetadataService.saveVideoMetadata(videoMetadataDto);
    }

    @Get()
    // TODO will this collide with the above :hash route?
    @Header('content-type', 'application/json')
    async allMetadata() {
        return this.videoMetadataService.allVideoMetadata();
    }
}