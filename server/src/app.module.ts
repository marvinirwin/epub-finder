import {MiddlewareConsumer, Module, NestModule} from "@nestjs/common";
import {DatabaseModule} from "./config/database.module";
import {ImageSearchHttpModule} from "./image-search/image-search-http.module";
import {SpeechHttpModule} from "./speech/speech-http.module";
import {TranslateHttpModule} from "./translate/translate-http.module";
import {UsersHttpModule} from "./user/users-http.module";
import {TranslateModule} from "./translate/translate.module";
import {ImageSearchModule} from "./image-search/image-search.module";
import {UsersModule} from "./user/user.module";
import {ServeStaticModule} from "@nestjs/serve-static";
import {SessionService} from "./session/session.service";
import {AuthModule} from "./auth/auth.module";
import {UsersService} from "./user/users.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {JsonCache} from "./entities/json-cache.entity";
import {session} from "./entities/session.entity";
import {ObservableModule} from "./observable/observable.module";
import {DocumentsModule} from "./documents/documents.module";
import {VideoMetadataModule} from "./video_metadata/video-metadata.module";
import {RecordRequestModule} from "./record-request/record-request.module";
import {LeaderBoardModule} from "./leaderboard/leader-board.module";
import {EntitiesModule} from "./entity-controller/entities.module";
import {CliService} from "./cli/cli.service";
import {ChineseVocabService} from "./shared/tabulate-documents/chinese-vocab.service";
import {CardView} from "./entities/card-view.entity";
import {TabulateService} from "./documents/similarity/tabulate.service";
import {CacheService} from "./util/cache.service";
import {DocumentView} from "./entities/document-view.entity";
import {ThaiController} from './thai/thai.controller';
import { APP_FILTER } from "@nestjs/core";
import {HttpErrorFilter} from "./filters/HttpErrorFilter";
import {resolve} from "path";
import {TimingMiddleware} from "./timing.middleware";


@Module({
    imports: [
        DatabaseModule,
        TranslateModule,
        TranslateHttpModule,
        SpeechHttpModule,
        ImageSearchModule,
        ImageSearchHttpModule,
        UsersModule,
        UsersHttpModule,
        ServeStaticModule.forRoot({
            rootPath: resolve("public"),
            serveRoot: "/",
        }),
        AuthModule,
        TypeOrmModule.forFeature([JsonCache, session, CardView, DocumentView]),
        ObservableModule,
        DocumentsModule,
        VideoMetadataModule,
        RecordRequestModule,
        EntitiesModule,
        LeaderBoardModule,
        /*
        */
    ],
    providers: [
        CacheService,
        ChineseVocabService,
        SessionService,
        UsersService,
        CliService,
        TabulateService,
        {
            provide: APP_FILTER,
            useClass: HttpErrorFilter
        },
    ],
    controllers: [ThaiController],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(TimingMiddleware).forRoutes('*');
    }
}
