import { Body, Controller, Header, Post, Res } from "@nestjs/common";
import { SpeechService, wavRoot } from "./speech.service";
import { SpeechSynthesisRequestDto } from "./speech-synthesis-request-dto";
import fs from "fs-extra";

@Controller("speech-synthesis")
export class SpeechSynthesisController {
    constructor(private speechService: SpeechService) {}

    @Post()
    @Header("Content-Type", "audio/wav")
    async synthesize(
        @Body() speechSynthesisRequest: SpeechSynthesisRequestDto,
        @Res() res,
    ) {
        if (!await this.speechService.audioFileExists(speechSynthesisRequest)) {
            console.log(`Cache miss ${JSON.stringify(speechSynthesisRequest)}`);
            await this.speechService.TextToSpeech(speechSynthesisRequest);

        } else {
            console.log(`Cache hit ${JSON.stringify(speechSynthesisRequest)}`);
        }
        const readStream = fs.createReadStream(this.speechService.audioFilePath(speechSynthesisRequest));
        readStream.on("error", err => {
            res.end(err);
        });
        readStream.pipe(res);
        return;
    }
}
