import { Module } from '@nestjs/common';
import { SpeechModule } from './speech.module';
import { SpeechService } from './speech.service';
import { SpeechSynthesisController } from './speech-synthesis.controller';
import { SpeechRecognitionController } from './speech-recognition.controller';

@Module({
    imports: [SpeechModule],
    providers: [SpeechService],
    controllers: [SpeechSynthesisController, SpeechRecognitionController]
})
export class SpeechHttpModule {}
