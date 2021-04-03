import { Body, Controller, Header, Post, Res } from '@nestjs/common'
import { SpeechService, wavRoot } from './speech.service'
import { SpeechSynthesisRequestDto } from './speech-synthesis-request-dto'
import fs from 'fs-extra'
import { join } from 'path'
import { sleep } from '../../../reader/src/lib/util/Util'

@Controller('speech-synthesis')
export class SpeechSynthesisController {
    constructor(private speechService: SpeechService) {}

    @Post()
    @Header('Content-Type', 'audio/wav')
    async synthesize(
        @Body() speechSynthesisRequest: SpeechSynthesisRequestDto,
        @Res() res,
    ) {
        if (!await this.speechService.audioFileExists(speechSynthesisRequest)) {
            console.log(`Cache miss ${JSON.stringify(speechSynthesisRequest)}`)
            await this.speechService.TextToSpeech(speechSynthesisRequest)
        } else {
            console.log(`Cache hit ${JSON.stringify(speechSynthesisRequest)}`)
        }
        fs.createReadStream(this.speechService.audioFilePath(speechSynthesisRequest)).pipe(res);
        return;
    }
}
