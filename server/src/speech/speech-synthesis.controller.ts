import { Body, Controller, Header, Post, Res } from '@nestjs/common'
import { SpeechService, wavRoot } from './speech.service'
import { SpeechSynthesisRequestDto } from './speech-synthesis-request-dto'
import fs from 'fs-extra'
import { join } from 'path'

@Controller('speech-synthesis')
export class SpeechSynthesisController {
    constructor(private speechService: SpeechService) {}

    @Post()
    @Header('Content-Type', 'audio/wav')
    async synthesize(
        @Body() speechSynthesisRequest: SpeechSynthesisRequestDto,
        @Res() res,
    ) {
        if (await this.speechService.audioFileExists(speechSynthesisRequest)) {
            console.log(`Cache hit ${JSON.stringify(speechSynthesisRequest)}`)
            fs.createReadStream(join(wavRoot, `${this.speechService.audioHash(speechSynthesisRequest)}.wav`)).pipe(res);
        }

        console.log(`Cache miss ${JSON.stringify(speechSynthesisRequest)}`)
        fs.createReadStream(await this.speechService.TextToSpeech(speechSynthesisRequest)).pipe(res)
    }
}
