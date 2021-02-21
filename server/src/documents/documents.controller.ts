import {Response} from "express";
import {
    Controller,
    Delete,
    Get,
    Header,
    Headers,
    HttpCode, HttpException,
    HttpStatus,
    Param,
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

@Controller('documents')
export class DocumentsController {
    constructor(
        private documentsService: DocumentsService,
        private uploadedFileService: HashService
    ) {

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
                    fileSize: 1024 * 1024 * 3 // 3MB file size
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
                existingDocumentWithSameName.rootId()
            )
        }
        const savedDocument = await this.documentsService.saveNew(
            user,
            name,
            output.index().s3Key,
        )
        return await this.documentsService.byFilename({filename: savedDocument.filename, user})
    }

    @Get('')
    async all(
        @UserFromReq() user: User | undefined,
        @Headers('is_test') is_test: string
    ) {
        return this.documentsService.all({user, for_testing: !!is_test, })
    }

    @Get('frequency-documents')
    async all_frequency(
        @Headers('is_test') is_test: string
    ) {
        return this.documentsService.all_frequency({for_testing: !!is_test})
    }


    @Delete(':id')
    @UseGuards(LoggedInGuard)
    async delete(
        @UserFromReq() user: User,
        @Param('id') id: string
    ) {
        return this.documentsService.delete(user, id)
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
}