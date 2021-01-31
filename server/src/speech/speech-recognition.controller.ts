import {Controller, Get, Post} from "@nestjs/common";
import {SpeechService} from "./speech.service";
import {Unprotected} from "nest-keycloak-connect";

@Controller('speech-recognition-token')
export class SpeechRecognitionController {
    constructor(private speechService: SpeechService) {}

    @Post()
    @Unprotected()
    async token() {
        return this.speechService.speechRecognitionToken()
    }
}
