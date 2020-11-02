import {config} from 'dotenv';
config({path: '.env'});
import {HttpAdapterHost, NestFactory} from '@nestjs/core';
import { AppModule } from './app.module';
import {LoggingInterceptor} from "./interceptors/logging.interceptor";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {AllExceptionsFilter} from "./filters/all-exceptions";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))
    const options = new DocumentBuilder()
        .setTitle('LanguageTrainer backend')
        .setDescription('The cats API description')
        .setVersion('1.0')
        .addTag('api')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
    await app.listen(process.env.HTTP_PORT);
}
bootstrap();