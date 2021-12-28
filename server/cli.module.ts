import {Module} from "@nestjs/common";
import {DatabaseModule} from "./src/config/database.module";
import {TranslateModule} from "./src/translate/translate.module";
import {ImageSearchModule} from "./src/image-search/image-search.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {JsonCache} from "./src/entities/json-cache.entity";
import {session} from "./src/entities/session.entity";
import {CardView} from "./src/entities/card-view.entity";
import {DocumentView} from "./src/entities/document-view.entity";
import {CacheService} from "./src/util/cache.service";
import {ChineseVocabService} from "./src/shared/tabulate-documents/chinese-vocab.service";
import {SessionService} from "./src/session/session.service";
import {CliService} from "./src/cli/cli.service";
import {TabulateService} from "./src/documents/similarity/tabulate.service";

@Module({
    imports: [
        DatabaseModule,
        TranslateModule,
        ImageSearchModule,
        TypeOrmModule.forFeature([JsonCache, session, CardView, DocumentView]),
    ],
    providers: [CacheService, ChineseVocabService, SessionService, CliService, TabulateService],
    controllers: [],
})
export class AppModule {}
