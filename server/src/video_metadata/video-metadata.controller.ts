import {VideoMetadataService} from "./video-metadata.service";
import {Body, Controller, Get, Param, Put} from "@nestjs/common";
import {VideoMetadataDto} from "./video-metadata.dto";


@Controller('video_metadata')
export class VideoMetadataController {
    constructor(private videoMetadataService: VideoMetadataService) {
    }

    @Get(":hash")
    async metadata(@Param() {hash}) {
        return this.videoMetadataService.resolveVideoMetadataByHash(hash)
    }

    @Put()
    async put(@Body() videoMetadataDto: VideoMetadataDto) {
        return this.videoMetadataService.saveVideoMetadata(videoMetadataDto);
    }
}