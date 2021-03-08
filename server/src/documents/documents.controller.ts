import {Response} from "express";
import {Document, documentRootId} from '../entities/document.entity';
import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
    Headers,
    HttpCode, HttpException,
    HttpStatus,
    Param, Post,
    Put,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {DocumentsService} from "./documents.service";
import {UserFromReq} from "../decorators/userFromReq";
import {User} from "../entities/user.entity";
import {LoggedInGuard} from "../guards/logged-in.guard";
import {FileInterceptor} from "@nestjs/platform-express";
import {HashService} from "./uploading/hash.service";
import multerS3 from 'multer-s3';
import {v4 as uuidv4} from 'uuid';
import {s3ReadStream, s3} from "./uploading/s3.service";
import {AnonymousGuard} from "../guards/anonymous.guard";
import {DocumentViewDto} from "./document-view.dto";
import {S3UploadedFile, UploadOutput} from "./uploading/s3-uploaded-file";
import {RevisionUpdater} from "../revision-updater";
import {DocumentView} from "../entities/document-view.entity";
import {DocumentUpdateDto} from "./document-update.dto";
import {LtDocument} from "../shared";
import {ltDocId} from "../shared/lt-document";

@Controller('documents')
export class DocumentsController {
    constructor(
        private documentsService: DocumentsService,
        private uploadedFileService: HashService
    ) {

    }


    @Get('')
    async all(
        @UserFromReq() user: User | undefined,
        @Headers('is_test') is_test: string
    ) {
        return this.documentsService.allDocuments({user, for_testing: !!is_test, })
    }

    @Put('')
    @UseGuards(AnonymousGuard)
    @UseInterceptors(
        FileInterceptor(
            'file',
            {
                storage: multerS3 ({
                    s3: s3,
                    bucket: 'languagetrainer-documents',
                    acl: 'public-read',
                    metadata: (req, file, cb) => {
                        return cb(null, {fieldName: file.fieldname});
                    },
                    key: (req, file, cb) => {
                        return cb(null, uuidv4());
                    }
                }),
                limits: {
                    files: 1,
                    fields: 1,
                    fileSize: 1024 * 1024 * 5 // 3MB file size
                }
            }
        )
    )
    async upload(
        @UploadedFile() file: { originalname: string, bucket: string, key: string, location: string },
        @UserFromReq() user: User,
        @Headers('document_id') document_id: string | undefined,
        @Headers('sandbox_file') sandbox_file: string | undefined,
    ): Promise<DocumentViewDto> {
        console.log(`Uploaded ${file.originalname} to S3 ${file.key}`);
        const output: UploadOutput = await new S3UploadedFile(
            file,
            !!sandbox_file
        ).output();
        const name = file.originalname.split('.').slice(0, -1).join('');
        if (document_id) {
            return this.documentsService.saveRevision(
                user,
                name,
                output.index().s3Key,
                document_id
            )
        }
        const existingDocumentWithSameName = await this.documentsService.byName(name, user)
        if (existingDocumentWithSameName) {
            return this.documentsService.saveRevision(
                user,
                name,
                output.index().s3Key,
                documentRootId(existingDocumentWithSameName)
            )
        }
        const savedDocument = await this.documentsService.saveNew(
            user,
            name,
            output.index().s3Key,
        )
        return await this.documentsService.byFilename({filename: savedDocument.filename, user})
    }


    @Get(':filename')
    @HttpCode(HttpStatus.OK)
    @Header('Content-Type', 'text/html')
    file(
        @UserFromReq() user: User | undefined,
        @Param('filename') filename: string,
        @Res() response: Response,
) {
        return new Promise(async (resolve, reject) => {
            const doc = await this.documentsService.byFilename(
                {filename, user}
                );
            if (!doc) {
                return reject(new HttpException(`Cannot find document ${filename} for user ${user?.id}`, 404));
            }

            (await s3ReadStream(filename)).pipe(response)
            resolve()
        })
    }

    @Post('update')
    @UseGuards(AnonymousGuard)
    async update(
        @Body() documentUpdateDto: DocumentUpdateDto,
        @UserFromReq() user: User | undefined
    ) {
        if (!user) {
            throw new HttpException("Not authorized to update document", 401)
        }
        const submitter = new RevisionUpdater<Document, DocumentUpdateDto>(
            r => this.documentsService.documentRepository.findOne(r.id),
            documentView => documentView.creator_id === user?.id,
            (currentVersion, newVersion) => ({
                ...currentVersion,
                document_id: ltDocId(documentUpdateDto),
                for_frequency: newVersion.for_frequency,
                for_reading: newVersion.for_reading,
                global: newVersion.global,
                name: newVersion.name,
                deleted: newVersion.deleted,
                id: undefined,
                created_at: undefined,
            }),
            newVersion => this.documentsService.documentRepository.save(newVersion),
            newVersion => ({
                ...newVersion,
                creator_id: user.id,
            })
        );
        // Check if we're allowed to modify this file
        return await submitter.SubmitRevision(documentUpdateDto);
/*
        return this.documentsService.update(
            user,
            {
                for_frequency: documentUpdateDto.for_frequency,
                name: documentUpdateDto.name,
                for_reading: documentUpdateDto.for_reading,
                global: documentUpdateDto.global,
                id: documentUpdateDto.id,
                deleted: documentUpdateDto.deleted
            }
        )
*/
    }
}