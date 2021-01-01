import {Response} from "express";
import {
    Controller,
    Delete,
    Get,
    Header,
    Headers,
    HttpCode,
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
import {parse} from "path";
import multerS3 from 'multer-s3';
import {v4 as uuidv4} from 'uuid';
import {conversionJob, convertPdfToHtml} from "./uploading/convert-to-html.service";
import {copyS3WithExtension, inputConfig, outputConfig, readStream, s3} from "./uploading/s3.service";
import {handleUploadedDocument} from "./uploading/document-upload.service";

@Controller('documents')
export class DocumentsController {
    constructor(
        private documentsService: DocumentsService,
        private uploadedFileService: HashService
    ) {

    }

    @Put('')
    @UseGuards(LoggedInGuard)
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
                        let uuidv = uuidv4();

                        return cb(null, uuidv);
                    }
                }),
                limits: {
                    files: 1,
                    fields: 1,
                    fileSize: 1024 * 1024 * 10 // 10MB file size
                }
            }
        )
    )
    async upload(
        @UploadedFile() file: { originalname: string, bucket: string, key: string, location: string },
        @UserFromReq() user: User,
        @Headers('document_id') document_id: string | undefined,
    ) {
        await handleUploadedDocument(file);
        const name = file.originalname.split('.').slice(0, -1).join('');
        const htmlKey = `${file.key}.html`;
        if (document_id) {
            return this.documentsService.saveRevision(
                user,
                name,
                htmlKey,
                document_id
            )
        }
        const existingDocumentWithSameName = await this.documentsService.byName(name, user)
        if (existingDocumentWithSameName) {
            return this.documentsService.saveRevision(
                user,
                name,
                htmlKey,
                existingDocumentWithSameName.rootId()
            )
        }
        return this.documentsService.saveNew(
            user,
            name,
            htmlKey,
        )
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
        @Res() response: Response
    ) {
        return new Promise(async (resolve, reject) => {
            const doc = await this.documentsService.byFilename(filename, user);
            if (!doc) {
                return reject(new Error(`Cannot find document ${filename} for user ${user?.id}`));
            }

            (await readStream(filename)).pipe(response)

            resolve()
            // @ts-ignore
            // return createReadStream(join(process.env.UPLOADED_FILE_DIRECTORY, doc.filename)).pipe(response);
        })
    }
}