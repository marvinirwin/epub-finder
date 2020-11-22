import {VideoMetadataService} from "./video-metadata.service";
import {Controller, Get, Param} from "@nestjs/common";


@Controller('video_metadata')
export class VideoMetadataController {
    constructor(private videoMetadataService: VideoMetadataService) {
    }

    @Get(":hash")
    async metadata(@Param() {hash}) {
        return this.videoMetadataService.resolveVideoMetadataByHash(hash)
    }
}