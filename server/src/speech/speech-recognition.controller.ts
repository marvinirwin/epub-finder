import {Controller, Get} from "@nestjs/common";
import {SpeechService} from "./speech.service";

@Controller('speech-recognition')
export class SpeechRecognitionController {
    constructor(private speechService: SpeechService) {}

    @Get()
    async token() {
        return this.speechService.speechRecognitionToken()
    }
}
