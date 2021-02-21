import {config} from 'dotenv';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {TabulateService} from "./documents/similarity/tabulate.service";

config({path: '.env'});


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const tabulateService = app.get(TabulateService);
}

bootstrap();
