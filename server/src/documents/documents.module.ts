import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Document} from "../entities/document.entity";
import {DocumentView} from "../entities/document-view.entity";
import {DocumentsController} from "./documents.controller";
import {DocumentsService} from "./documents.service";
import {User} from "../entities/user.entity";
import {HashService} from "./uploading/hash.service";
import {UploadOnStartupService} from "./built-in-documents/upload-on-startup.service";
import {TabulateService} from "./similarity/tabulate.service";
import {CacheService} from "../util/cache.service";
import {JsonCache} from "../entities/json-cache.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Document, DocumentView, User, JsonCache]),
    ],
    controllers: [
        DocumentsController
    ],
    providers: [
        DocumentsService,
        HashService,
        UploadOnStartupService,
        TabulateService,
        CacheService
    ]
})
export class DocumentsModule {}
