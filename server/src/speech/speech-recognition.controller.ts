import {Controller, Get, Post} from "@nestjs/common";
import {SpeechService} from "./speech.service";

@Controller('speech-recognition-token')
export class SpeechRecognitionController {
    constructor(private speechService: SpeechService) {}

    @Post()
    async token() {
        return this.speechService.speechRecognitionToken()
    }
}
