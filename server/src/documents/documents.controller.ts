import {Request, Response} from "express";
import {
    Body,
    Controller,
    Delete,
    Get, Header,
    Headers, HttpCode, HttpStatus,
    Param,
    Put, Res,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {DocumentsService} from "./documents.service";
import {UserFromReq} from "../decorators/userFromReq";
import {User} from "../entities/user.entity";
import {LoggedInGuard} from "../guards/logged-in.guard";
import {FileInterceptor} from "@nestjs/platform-express";
import {UploadedFileService} from "./uploaded-file.service";
import {UploadedDocument} from "./uploaded-document";
import {createReadStream} from "fs";
import {join} from "path";

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
        return this.documentsService.all(user)
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
        return this.documentsService.all(user)
    }

    @Put('')
    @UseGuards(LoggedInGuard)
    @UseInterceptors(
        FileInterceptor(
            'file',
            {
                dest: process.env.UPLOADED_FILE_DIRECTORY,
                limits: {
                    files: 1,
                    fields: 1,
                    fileSize: 1024 * 1024 * 10 // 10MB file size
                }
            }
        )
    )
    async upload(
        @UploadedFile() file: { originalname: string, path: string },
        @UserFromReq() user: User,
        @Headers('document_id') document_id: string,
        @Headers('name') name: string,
    ) {
        const f = new UploadedDocument(file.path, file.originalname);
        await UploadedFileService.normalise(f);
        if (document_id) {
            return this.documentsService.saveRevision(
                user,
                name,
                f.htmlFilePath(),
                document_id
            )
        }
        return this.documentsService.saveNew(
            user,
            name,
            f.htmlFilePath(),
        )
    }

    @Delete(':id')
    @UseGuards(LoggedInGuard)
    async delete(
        @UserFromReq() user: User,
        @Param('id') id: string
    ) {
        return this.documentsService.delete( user, id)
    }

    @Get(':filename')
    @HttpCode(HttpStatus.OK)
    @Header('Content-Type', 'text/html')
    async file(
        @UserFromReq() user: User | undefined,
        @Param('filename') filename: string,
        @Res() response: Response
    ) {
        const doc = await this.documentsService.byFilename(filename, user);
        if (!doc) {
            throw new Error(`Cannot find document ${filename} for user ${user?.id}`)
        }
        // @ts-ignore
        return createReadStream(join(process.env.UPLOADED_FILE_DIRECTORY, doc.filename)).pipe(response);
    }
}