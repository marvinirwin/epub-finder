import {Module} from "@nestjs/common";
import {DatabaseModule} from "./config/database.module";
import {TranslateModule} from "./translate/translate.module";
import {ImageSearchModule} from "./image-search/image-search.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {JsonCache} from "./entities/json-cache.entity";
import {session} from "./entities/session.entity";
import {CardView} from "./entities/card-view.entity";
import {DocumentView} from "./entities/document-view.entity";
import {CacheService} from "./util/cache.service";
import {ChineseVocabService} from "./shared/tabulate-documents/chinese-vocab.service";
import {SessionService} from "./session/session.service";
import {CliService} from "./cli/cli.service";
import {TabulateService} from "./documents/similarity/tabulate.service";

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
export class CliModule {}
