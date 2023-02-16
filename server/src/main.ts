import { config } from "dotenv";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./interceptors/logging.interceptor";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AllExceptionsFilter } from "./filters/all-exceptions";
import { TypeormStore } from "typeorm-store";
import passport from "passport";
import { SessionService } from "./session/session.service";
import session from "express-session";

config({ path: ".env" });


const args = process.argv.slice(1);
const isCli = Boolean(process.env.CLI);

const port = process.env.HTTP_PORT;

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: true });
    const { httpAdapter } = app.get(HttpAdapterHost);
    const options = new DocumentBuilder()
        .setTitle("LanguageTrainer backend")
        .setVersion("1.0")
        .addTag("api")
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup("api", app, document);
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
            secret: process.env.SESSION_SECRET_KEY,
            store: new TypeormStore({
                repository: app.get(SessionService).sessionRepository,
            }),
            resave: false,
            saveUninitialized: false
        }),
    );

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(function(request, response, next) {
        if (request.session && !request.session.regenerate) {
            request.session.regenerate = (cb) => {
                cb()
            }
        }
        if (request.session && !request.session.save) {
            request.session.save = (cb) => {
                cb()
            }
        }
        next()
    })
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
    await app.listen(port, '0.0.0.0');
    console.log(`Listing on ${port}`);
}
bootstrap();
