import {Response} from "express";
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
import {basename, join, parse} from "path";
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

import AWS from 'aws-sdk';
import {convertToHtml} from "./convert-to-html.service";
import {BucketConfig} from "./bucket-config.interface";
import fs, {rename} from "fs-extra";
import {InterpolateService} from "../shared";

let inputAccessKeyId = process.env.DOCUMENT_S3_ACCESS_KEY_ID;
let inputSecretAccessKey = process.env.DOCUMENT_S3_ACCESS_KEY_SECRET;
let converterOutputKeyId = process.env.DOCUMENT_CONVERTER_OUTPUT_S3_ACCESS_KEY_ID;
let converterOutputSecretKeyId = process.env.DOCUMENT_CONVERTER_OUTPUT_S3_ACCESS_KEY_SECRET;
const s3Region = process.env.DOCUMENT_S3_REGION;
const bucket = process.env.DOCUMENT_S3_BUCKET;
const s3 = new AWS.S3({
    accessKeyId: inputAccessKeyId,
    secretAccessKey: inputSecretAccessKey,
});
const inputConfig: BucketConfig = {
    region: s3Region,
    access_key_id: inputAccessKeyId,
    secret_access_key: inputSecretAccessKey,
    bucket
}
const outputConfig: BucketConfig = {
    region: s3Region,
    access_key_id: converterOutputKeyId,
    secret_access_key: converterOutputSecretKeyId,
    bucket
};

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
        debugger;
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
/*
            case "txt":
                // If it's text then read the whole file, run it through the converter and then write it to s3
                const text = (await s3.getObject())
                const text = (await fs.read(uploadedFile.uploadedFilePath)).toString("utf8");
                await fs.writeFile(uploadedFile.htmlFilePath(), InterpolateService.text(text))
                break;
            case "html":
                // Copy the file in s3
                return await rename(uploadedFile.uploadedFilePath, join(
                    process.env.UPLOADED_FILE_DIRECTORY,
                    basename(uploadedFile.sourceFilePath)
                ))
                break;
*/
            default:
                throw new Error(`Unsupported file extension: ${ext}`);
        }
/*
        switch (ext) {
            case "pdf":

                debugger;
                return;
        }
*/
/*
        const name = /!*file.split('.').slice(0, -1).join('')*!/ key;
        await UploadedFileService.normalise(f);
        if (document_id) {
            return this.documentsService.saveRevision(
                user,
                name,
                f.htmlFilePath(),
                document_id
            )
        }
        const existingDocumentWithSameName = await this.documentsService.byName(name, user)
        if (existingDocumentWithSameName) {
            return this.documentsService.saveRevision(
                user,
                name,
                f.htmlFilePath(),
                existingDocumentWithSameName.rootId()
            )
        }
        return this.documentsService.saveNew(
            user,
            name,
            f.htmlFilePath(),
        )
*/
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
        // @ts-ignore
        return createReadStream(join(process.env.UPLOADED_FILE_DIRECTORY, doc.filename)).pipe(response);
    }
}