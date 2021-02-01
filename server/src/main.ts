import {config} from 'dotenv';
import {HttpAdapterHost, NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {LoggingInterceptor} from "./interceptors/logging.interceptor";
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {AllExceptionsFilter} from "./filters/all-exceptions";
import {TypeormStore} from "typeorm-store";
import passport from "passport";
import {SessionService} from "./session/session.service";
import session from 'express-session';
import Keycloak from 'keycloak-connect';

config({path: '.env'});


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))
    const options = new DocumentBuilder()
        .setTitle('LanguageTrainer backend')
        .setVersion('1.0')
        .addTag('api')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
    const typeormStore = new TypeormStore({
        repository: app.get(SessionService).sessionRepository
    });
    const keycloak = new Keycloak({store: typeormStore});
    app.use(
        session({
            cookie: {
                path: "/",
                httpOnly: true,
                secure: false,
                maxAge: 24 * 60 * 60 * 1000,
                signed: false,
            },
            name: "nest",
            resave: false,
            secret: process.env.SESSION_SECRET_KEY,
            store: typeormStore,
            saveUninitialized: true,
        }),
    );

    app.use(keycloak.middleware());
    await app.listen(process.env.HTTP_PORT);
}
bootstrap();