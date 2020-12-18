import {
    Body,
    Controller,
    Get,
    Headers,
    Post,
    Put,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {DocumentsService} from "./documents.service";
import {UserFromReq} from "../decorators/userFromReq";
import {User} from "../entities/user.entity";
import {LoggedInGuard} from "../guards/logged-in.guard";
import {DocumentToBeSavedDto} from "./document-to-be-saved.dto";
import {AnyFilesInterceptor, FileInterceptor} from "@nestjs/platform-express";

@Controller('documents')
export class DocumentsController {
    constructor(private documentsService: DocumentsService) {

    }

    @Get('/available')
    async availableDocuments(
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

    @Get('/all')
    async allDocuments(
        @UserFromReq() user: User | undefined
    ) {
        return this.documentsService.queryAvailableDocuments(user)
    }

    @Put('')
    @UseGuards(LoggedInGuard)
    async putDocument(
        @UserFromReq() user: User,
        @Body() documentToBeSavedDto: DocumentToBeSavedDto
    ) {
        return this.documentsService.saveDocumentForUser(user, documentToBeSavedDto)
    }

    @Put('file')
    @UseGuards(LoggedInGuard)
    @UseInterceptors(
        AnyFilesInterceptor({
            dest: process.env.UPLOADED_FILE_DIRECTORY,
        })
    )
    async uploadDocument(
        @UploadedFile() file,
        @UserFromReq() user: User,
        @Headers('document_id') document_id: string,
        @Headers('name') name: string,
        @Headers('deleted') deleted: string,
    ) {
        const documentToBeSavedDto: DocumentToBeSavedDto = {
            document_id,
            name,
            deleted: deleted === 'true'
        };
    }

    /*
        @Post('upload')
        @UseInterceptors(FileInterceptor('file'))
        async putFile(@UserFromReq() user: User | undefined, @UploadedFile() file) {
        }
    */
}