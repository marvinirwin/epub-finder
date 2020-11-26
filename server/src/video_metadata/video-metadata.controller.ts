import {VideoMetadataService} from "./video-metadata.service";
import {Body, Controller, Get, Header, Param, Put} from "@nestjs/common";
import {VideoMetadataDto} from "./video-metadata.dto";


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
}