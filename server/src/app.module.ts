import { Module } from '@nestjs/common';
import {DatabaseModule} from "./config/database.module"
import {ImageSearchHttpModule} from "./image-search/image-search-http.module";
import {SpeechHttpModule} from "./speech/speech-http.module";
import {TranslateHttpModule} from "./translate/translate-http.module";
import {UsersHttpModule} from "./user/users-http.module";
import {TranslateModule} from "./translate/translate.module";
import {SpeechModule} from "./speech/speech.module";
import {ImageSearchModule} from "./image-search/image-search.module";
import {UsersModule} from "./user/user.module";
import { ServeStaticModule } from '@nestjs/serve-static';
import {join} from "path";

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
            rootPath: join(__dirname, '..', 'public/video'),
            serveRoot: '/video/',
        }),
    ],
})
export class AppModule {}