import {Body, Controller, Header, Post, Res} from '@nestjs/common';
import {SpeechService} from "./speech.service";
import {SpeechSynthesisRequestDto} from "./speech-synthesis-request-dto";
import fs from "fs-extra";

@Controller('speech-synthesis')
export class SpeechSynthesisController {
    constructor(private speechService: SpeechService) {}

/*
    @Post()
    @Header('Content-Type', 'audio/wav')
    async synthesize(
        @Body() speechSynthesisRequest: SpeechSynthesisRequestDto,
        @Res() res,
    ) {
        if (await this.speechService.audioFileExists(speechSynthesisRequest)) {
            console.log(`Cache hit ${JSON.stringify(speechSynthesisRequest)}`)
            return fs.createReadStream(this.speechService.audioFilePath(speechSynthesisRequest));
        }

        console.log(`Cache miss ${JSON.stringify(speechSynthesisRequest)}`)
        const cost = JSON.stringify(speechSynthesisRequest).length * 4;
        return fs.createReadStream(await this.speechService.TextToSpeech(speechSynthesisRequest))
    }
*/
}