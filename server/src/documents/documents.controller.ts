import {Body, Controller, Get, Headers, Put, UploadedFile, UseGuards, UseInterceptors} from "@nestjs/common";
import {DocumentsService} from "./documents.service";
import {UserFromReq} from "../decorators/userFromReq";
import {User} from "../entities/user.entity";
import {LoggedInGuard} from "../guards/logged-in.guard";
import {DocumentToBeSavedDto} from "./document-to-be-saved.dto";
import {AnyFilesInterceptor} from "@nestjs/platform-express";
import {UploadedFileService} from "./uploaded-file.service";
import {join, normalize} from "path";

@Controller('documents')
export class DocumentsController {
    constructor(
        private documentsService: DocumentsService,
        private uploadedFileService: UploadedFileService
    ) {

    }

    @Get('/available')
    async available(
        @UserFromReq() user: User | undefined
    ) {
        return this.documentsService.queryAvailableDocuments(user)
            .then(availableDocuments => availableDocuments.map(documentView => ({
                name: documentView.name,
                id: documentView.id,
                lastModified: documentView.created_at,
                belongsToUser: documentView.creator_id === user?.id
            })))
    }

    @Get('')
    async all(
        @UserFromReq() user: User | undefined
    ) {
        return this.documentsService.queryAvailableDocuments(user)
    }

    @Put('')
    @UseGuards(LoggedInGuard)
    async put(
        @UserFromReq() user: User,
        @Body() documentToBeSavedDto: DocumentToBeSavedDto
    ) {
        return this.documentsService.saveDocumentForUser(user, documentToBeSavedDto)
    }

    @Put('upload')
    @UseGuards(LoggedInGuard)
    @UseInterceptors(
        AnyFilesInterceptor({
            dest: process.env.UPLOADED_FILE_DIRECTORY,
            limits: {
                files: 1,
                fields: 0,
                fileSize: 1024 * 1024 * 10 // 10MB file size
            }
        })
    )
    async upload(
        @UploadedFile() file,
        @UserFromReq() user: User,
        @Headers('document_id') document_id: string,
        @Headers('name') name: string,
    ) {
        const htmlPath = normalize(join(file.destination, file.filename));
        return await this.documentsService.saveDocumentForUser(
            user,
            {
                document_id,
                name,
            }
        );
    }
}