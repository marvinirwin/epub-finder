import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Document} from "../entities/document.entity";
import {DocumentView} from "../entities/document-view.entity";
import {DocumentsController} from "./documents.controller";
import {DocumentsService} from "./documents.service";
import {User} from "../entities/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Document, DocumentView, User]),

    ],
    controllers: [
        DocumentsController
    ],
    providers: [
        DocumentsService
    ]
})
export class DocumentsModule {}
