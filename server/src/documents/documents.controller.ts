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
import {UploadedFileService} from "./uploaded-file.service";
import {parse} from "path";
import multerS3 from 'multer-s3';
import {v4 as uuidv4} from 'uuid';
import {convertToHtml} from "./convert-to-html.service";
import {bucket, inputConfig, outputConfig, s3} from "./s3.service";

@Controller('documents')
export class DocumentsController {
    constructor(
        private documentsService: DocumentsService,
        private uploadedFileService: UploadedFileService
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
        const ext = parse(file.originalname).ext.replace('.', '');
        switch(ext) {
            case "pdf":
            case "docx":
                await convertToHtml({
                    inputFormat: ext,
                    inputBucket: inputConfig,
                    outputBucket: outputConfig,
                    key: file.key
                });
                break;
            default:
                throw new Error(`Unsupported file extension: ${ext}`);
        }
        const name = file.originalname.split('.').slice(0, -1).join('');
        let htmlKey = `${file.key}.html`;
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
    async file(
        @UserFromReq() user: User | undefined,
        @Param('filename') filename: string,
        @Res() response: Response
    ) {
        const doc = await this.documentsService.byFilename(filename, user);
        if (!doc) {
            throw new Error(`Cannot find document ${filename} for user ${user?.id}`)
        }

        return s3.getObject({Bucket: bucket, Key: filename}).createReadStream().pipe(response);
        // @ts-ignore
        // return createReadStream(join(process.env.UPLOADED_FILE_DIRECTORY, doc.filename)).pipe(response);
    }
}