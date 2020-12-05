import { Module } from '@nestjs/common';
import { SpeechModule } from './speech.module';
import { SpeechService } from './speech.service';
import { SpeechSynthesisController } from './speech-synthesis.controller';
import { SpeechRecognitionController } from './speech-recognition.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {SpeechToken} from "../entities/speech-token.entity";

@Module({
    imports: [
        SpeechModule,
        TypeOrmModule.forFeature([SpeechToken])
    ],
    providers: [SpeechService],
    controllers: [SpeechSynthesisController, SpeechRecognitionController]
})
export class SpeechHttpModule {}
