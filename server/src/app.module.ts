import {Module} from "@nestjs/common";
import {DatabaseModule} from "./config/database.module";
import {ImageSearchHttpModule} from "./image-search/image-search-http.module";
import {SpeechHttpModule} from "./speech/speech-http.module";
import {TranslateHttpModule} from "./translate/translate-http.module";
import {UsersHttpModule} from "./user/users-http.module";
import {TranslateModule} from "./translate/translate.module";
import {SpeechModule} from "./speech/speech.module";
import {ImageSearchModule} from "./image-search/image-search.module";
import {UsersModule} from "./user/user.module";
import {ServeStaticModule} from "@nestjs/serve-static";
import {SessionService} from "./session/session.service";
import { AuthModule } from "./auth/auth.module";
import { UsersService } from "./user/users.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {JsonCache} from "./entities/json-cache.entity";
import {session} from "./entities/session.entity";
import {ObservableModule} from "./observable/observable.module";
import {DocumentsModule} from "./documents/documents.module";
import {VideoMetadataModule} from "./video_metadata/video-metadata.module";
import {RecordRequestModule} from "./record-request/record-request.module";
import { SubtitlesController } from './subtitles/subtitles.controller';

@Module({
    imports: [
        DatabaseModule,
        TranslateModule,
        TranslateHttpModule,
        SpeechModule,
        SpeechHttpModule,
        ImageSearchModule,
        ImageSearchHttpModule,
        UsersModule,
        UsersHttpModule,
        ServeStaticModule.forRoot({
            rootPath: "public",
            serveRoot: "/",
        }),
        AuthModule,
        TypeOrmModule.forFeature([JsonCache, session]),
        ObservableModule,
        DocumentsModule,
        VideoMetadataModule,
        RecordRequestModule,
    ],
    providers: [
        SessionService,
        UsersService,
    ],
    controllers: [],
})
export class AppModule {
}